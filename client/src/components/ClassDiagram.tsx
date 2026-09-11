import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

interface ClassDiagramProps {
  code: string;
}

export const ClassDiagram: React.FC<ClassDiagramProps> = ({ code }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  // Initialize mermaid with dark theme
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0d121f',
        primaryColor: '#6366f1',
        primaryTextColor: '#f3f4f6',
        primaryBorderColor: '#4f46e5',
        lineColor: '#06b6d4',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a'
      },
      securityLevel: 'loose'
    });
  }, []);

  // Generate Mermaid class diagram string from user code
  useEffect(() => {
    const generateDiagramDefinition = (source: string): string => {
      const lines = source.split('\n');
      const classes: { name: string; isInterface: boolean; methods: string[]; fields: string[] }[] = [];
      const relationships: string[] = [];

      let current: { name: string; isInterface: boolean; methods: string[]; fields: string[] } | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

        // Interface match
        const ifaceMatch = trimmed.match(/(?:export\s+)?interface\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_,\s]+))?/);
        if (ifaceMatch) {
          if (current) classes.push(current);
          const name = ifaceMatch[1];
          current = { name, isInterface: true, methods: [], fields: [] };
          if (ifaceMatch[2]) {
            const parents = ifaceMatch[2].split(',').map(s => s.trim());
            for (const p of parents) {
              relationships.push(`${p} <|-- ${name}`);
            }
          }
          continue;
        }

        // Class match
        const classMatch = trimmed.match(/(?:export\s+)?(?:(abstract)\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?/);
        if (classMatch) {
          if (current) classes.push(current);
          const name = classMatch[2];
          current = { name, isInterface: false, methods: [], fields: [] };
          if (classMatch[3]) {
            relationships.push(`${classMatch[3].trim()} <|-- ${name}`);
          }
          if (classMatch[4]) {
            const ifaces = classMatch[4].split(',').map(s => s.trim());
            for (const iface of ifaces) {
              relationships.push(`${iface} <|.. ${name}`);
            }
          }
          continue;
        }

        if (current) {
          // Method
          const methodMatch = trimmed.match(/(?:public|private|protected)?\s*(?:async\s+)?([A-Za-z0-9_]+)\s*\([^)]*\)/);
          if (methodMatch && !['if', 'for', 'while', 'switch', 'catch', 'constructor'].includes(methodMatch[1])) {
            if (current.methods.length < 5) {
              current.methods.push(`+${methodMatch[1]}()`);
            }
          }
        }
      }

      if (current) classes.push(current);

      if (classes.length === 0) {
        return `classDiagram
          class StarterModel {
            +addYourClasses()
          }`;
      }

      let diagram = 'classDiagram\n';
      for (const c of classes) {
        diagram += `  class ${c.name} {\n`;
        if (c.isInterface) {
          diagram += `    <<interface>>\n`;
        }
        for (const f of c.fields) {
          diagram += `    ${f}\n`;
        }
        for (const m of c.methods) {
          diagram += `    ${m}\n`;
        }
        diagram += `  }\n`;
      }

      for (const rel of relationships) {
        diagram += `  ${rel}\n`;
      }

      return diagram;
    };

    const renderMermaid = async () => {
      try {
        const definition = generateDiagramDefinition(code);
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, definition);
        setSvgContent(svg);
        setRenderError(null);
      } catch (err: any) {
        // Fallback or maintain previous svg
        setRenderError('Parsing live class hierarchy...');
      }
    };

    const timer = setTimeout(renderMermaid, 350);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="diagram-container">
      {svgContent ? (
        <div 
          dangerouslySetInnerHTML={{ __html: svgContent }} 
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }} 
        />
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>
          <p>{renderError || 'Class diagram will render as you define classes and interfaces.'}</p>
        </div>
      )}
    </div>
  );
};
