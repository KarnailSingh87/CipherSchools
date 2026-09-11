import { ParsedAst, ParsedClass } from '../types.js';

export class AstParser {
  /**
   * Parses code into a structured AST summary.
   * Supports TypeScript/JavaScript and Python/Java style object-oriented declarations.
   */
  static parse(code: string): ParsedAst {
    const lines = code.split('\n');
    const classes: ParsedClass[] = [];
    const interfaces: ParsedClass[] = [];

    let currentClass: ParsedClass | null = null;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // Skip comments
      if (line.startsWith('//') || line.startsWith('#') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }

      // Check for interface declaration: interface X extends Y
      const interfaceMatch = line.match(/(?:export\s+)?interface\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_,\s]+))?/);
      if (interfaceMatch) {
        if (currentClass) {
          if (currentClass.isInterface) interfaces.push(currentClass);
          else classes.push(currentClass);
        }
        const name = interfaceMatch[1];
        const extendsNames = interfaceMatch[2] ? interfaceMatch[2].split(',').map(s => s.trim()) : [];
        currentClass = {
          name,
          isInterface: true,
          isAbstract: false,
          implementsInterfaces: extendsNames,
          methods: [],
          fields: [],
          lineCount: 0
        };
        continue;
      }

      // Check for class declaration: class X extends Y implements A, B
      const classMatch = line.match(/(?:export\s+)?(?:(abstract)\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?/);
      if (classMatch) {
        if (currentClass) {
          if (currentClass.isInterface) interfaces.push(currentClass);
          else classes.push(currentClass);
        }
        const isAbstract = !!classMatch[1];
        const name = classMatch[2];
        const extendsClass = classMatch[3]?.trim();
        const implementsInterfaces = classMatch[4] ? classMatch[4].split(',').map(s => s.trim()) : [];

        currentClass = {
          name,
          isInterface: false,
          isAbstract,
          extendsClass,
          implementsInterfaces,
          methods: [],
          fields: [],
          lineCount: 0
        };
        continue;
      }

      // Python class definition: class X(Y):
      const pyClassMatch = line.match(/^class\s+([A-Za-z0-9_]+)(?:\(([^)]+)\))?\s*:/);
      if (pyClassMatch) {
        if (currentClass) {
          if (currentClass.isInterface) interfaces.push(currentClass);
          else classes.push(currentClass);
        }
        const name = pyClassMatch[1];
        const base = pyClassMatch[2]?.trim();
        const isInterface = name.startsWith('I') || (base && base.toLowerCase().includes('interface') || base?.toLowerCase().includes('abc'));
        currentClass = {
          name,
          isInterface: !!isInterface,
          isAbstract: false,
          extendsClass: base,
          implementsInterfaces: [],
          methods: [],
          fields: [],
          lineCount: 0
        };
        continue;
      }

      if (currentClass) {
        currentClass.lineCount++;

        // Track method declarations:
        // e.g. public park(vehicle: Vehicle): Ticket
        // or def park(self, vehicle):
        const tsMethodMatch = line.match(/(?:(public|private|protected)\s+)?(?:async\s+)?([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(?::\s*([^{;]+))?/);
        const pyMethodMatch = line.match(/def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/);

        if (pyMethodMatch) {
          const methodName = pyMethodMatch[1];
          if (methodName !== '__init__') {
            const params = pyMethodMatch[2].split(',').map(p => p.trim()).filter(p => p && p !== 'self');
            currentClass.methods.push({
              name: methodName,
              visibility: methodName.startsWith('_') ? 'private' : 'public',
              params,
              line: lineNum,
              instantiatedClasses: []
            });
          }
        } else if (tsMethodMatch && !['if', 'for', 'while', 'switch', 'catch', 'constructor'].includes(tsMethodMatch[2])) {
          const visibility = (tsMethodMatch[1] as 'public' | 'private' | 'protected') || 'public';
          const methodName = tsMethodMatch[2];
          const params = tsMethodMatch[3].split(',').map(p => p.trim()).filter(Boolean);
          const returnType = tsMethodMatch[4]?.trim();

          currentClass.methods.push({
            name: methodName,
            visibility,
            params,
            returnType,
            line: lineNum,
            instantiatedClasses: []
          });
        }

        // Track concrete instantiations: new ClassName(...)
        const newMatches = [...line.matchAll(/new\s+([A-Z][A-Za-z0-9_]+)\s*\(/g)];
        if (newMatches.length > 0 && currentClass.methods.length > 0) {
          const lastMethod = currentClass.methods[currentClass.methods.length - 1];
          for (const m of newMatches) {
            const instantiatedName = m[1];
            if (!['Date', 'Map', 'Set', 'Array', 'Error', 'Promise'].includes(instantiatedName)) {
              lastMethod.instantiatedClasses.push(instantiatedName);
            }
          }
        }

        // Track field declarations: private spots: ParkingSpot[]
        const fieldMatch = line.match(/(?:(public|private|protected)\s+)?(?:readonly\s+)?([A-Za-z0-9_]+)\s*:\s*([^;=]+)/);
        if (fieldMatch && !line.includes('(') && currentClass) {
          currentClass.fields.push({
            name: fieldMatch[2],
            visibility: (fieldMatch[1] as 'public' | 'private' | 'protected') || 'public',
            type: fieldMatch[3]?.trim()
          });
        }
      }
    }

    if (currentClass) {
      if (currentClass.isInterface) interfaces.push(currentClass);
      else classes.push(currentClass);
    }

    const allClassNames = classes.map(c => c.name);
    const allInterfaceNames = interfaces.map(i => i.name);
    const godClasses = classes.filter(c => c.methods.length >= 7).map(c => c.name);

    const tightlyCoupledPairs: { fromClass: string; toClass: string }[] = [];
    for (const c of classes) {
      for (const m of c.methods) {
        for (const target of m.instantiatedClasses) {
          if (allClassNames.includes(target) && target !== c.name) {
            tightlyCoupledPairs.push({ fromClass: c.name, toClass: target });
          }
        }
      }
    }

    return {
      classes,
      interfaces,
      totalLines: lines.length,
      allClassNames,
      allInterfaceNames,
      godClasses,
      tightlyCoupledPairs
    };
  }
}
