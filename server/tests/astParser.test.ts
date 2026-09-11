import { describe, it, expect } from 'vitest';
import { AstParser } from '../src/domain/evaluator/AstParser.js';

describe('AstParser', () => {
  it('correctly parses classes, interfaces, and methods', () => {
    const code = `
      export interface Vehicle {
        licensePlate: string;
      }

      export class Car implements Vehicle {
        public licensePlate: string = '';
        public drive(speed: number): void {}
        public stop(): void {}
      }
    `;

    const ast = AstParser.parse(code);
    expect(ast.interfaces.length).toBe(1);
    expect(ast.interfaces[0].name).toBe('Vehicle');
    expect(ast.classes.length).toBe(1);
    expect(ast.classes[0].name).toBe('Car');
    expect(ast.classes[0].implementsInterfaces).toContain('Vehicle');
    expect(ast.classes[0].methods.map(m => m.name)).toEqual(['drive', 'stop']);
  });

  it('detects God class when methods exceed threshold', () => {
    const code = `
      export class MonolithLot {
        m1() {}
        m2() {}
        m3() {}
        m4() {}
        m5() {}
        m6() {}
        m7() {}
        m8() {}
      }
    `;

    const ast = AstParser.parse(code);
    expect(ast.godClasses).toContain('MonolithLot');
  });

  it('tracks direct concrete instantiations for DIP analysis', () => {
    const code = `
      export class SpotManager {}
      export class ParkingLot {
        public park() {
          const mgr = new SpotManager();
        }
      }
    `;

    const ast = AstParser.parse(code);
    expect(ast.tightlyCoupledPairs).toEqual([
      { fromClass: 'ParkingLot', toClass: 'SpotManager' }
    ]);
  });
});
