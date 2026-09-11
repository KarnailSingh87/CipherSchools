import { Problem } from '../domain/entities/Problem.js';

export const seedProblems: Problem[] = [
  new Problem({
    id: 'prob-parking-lot',
    slug: 'parking-lot',
    title: 'Parking Lot Management System',
    difficulty: 'MEDIUM',
    tags: ['Strategy Pattern', 'State Pattern', 'Machine Coding', 'Interview Classic'],
    summary: 'Design a multi-floor parking lot system supporting multiple vehicle types, dynamic spot allocation, ticketing, and extensible hourly fee calculation.',
    description: `A commercial parking lot operates across multiple floors. Vehicles arrive at entry gates, receive a parking ticket with a timestamp, occupy an appropriately-sized spot, and pay at exit gates before leaving.

The system must handle peak-hour traffic cleanly and allow parking lot operators to easily swap pricing formulas or allocation policies without taking down the lot.`,
    requirements: [
      'Support multiple vehicle types: Motorcycle (small), Car (compact/medium), Truck/Bus (large).',
      'The parking lot has multiple floors, and each floor contains designated spots for each vehicle type.',
      'Entry Gate issues an entry Ticket containing a unique ID, assigned spot, and entry timestamp.',
      'Spot Allocation: When a vehicle arrives, assign the nearest available spot that fits the vehicle.',
      'Exit Gate processes the Ticket, calculates the fee based on elapsed time and vehicle type, and marks the spot available.',
      'Display Board shows the count of available spots per vehicle type for each floor.'
    ],
    constraints: [
      'Concurrency: Multiple entry and exit gates operate concurrently; double-booking the same spot is unacceptable.',
      'Extensibility: Business rules for fee calculation (e.g. flat rate, progressive hourly rate, weekend surge) must be swappable without modifying the core ParkingLot class.',
      'Capacity: If no valid spot exists for a vehicle type, the entry gate must reject entry with a clear notification.'
    ],
    expectedDomainEntities: ['ParkingLot', 'ParkingSpot', 'Vehicle', 'Ticket', 'Gate'],
    starterCode: {
      typescript: `// ==========================================
// PARKING LOT SYSTEM - STARTER TEMPLATE
// Define your core domain classes and interfaces
// ==========================================

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  TRUCK = 'TRUCK'
}

export enum SpotType {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

export interface Vehicle {
  licensePlate: string;
  type: VehicleType;
}

export class ParkingSpot {
  constructor(
    public readonly id: string,
    public readonly floorNumber: number,
    public readonly spotType: SpotType,
    private _isOccupied: boolean = false
  ) {}

  get isOccupied(): boolean {
    return this._isOccupied;
  }

  assignVehicle(vehicle: Vehicle): void {
    if (this._isOccupied) throw new Error('Spot is already occupied');
    this._isOccupied = true;
  }

  vacate(): void {
    this._isOccupied = false;
  }
}

export interface Ticket {
  id: string;
  spotId: string;
  vehicle: Vehicle;
  entryTime: Date;
}

// TODO: Introduce Fee Calculation Strategy & Spot Allocation Strategy
// TODO: Implement ParkingLot, Floor, and Gate classes
export class ParkingLot {
  private spots: ParkingSpot[] = [];

  constructor(public readonly name: string) {}

  // Implement park, vacate, and fee calculations
}
`
    },
    starterRationale: `### Design Decisions & Assumptions
1. **Vehicle vs Spot Fitting**: Small vehicles can park in Small or Medium spots, but Large vehicles require Large spots.
2. **Strategy Pattern**: Extracted FeeCalculationStrategy to allow flat rates, weekend rates, and vehicle-type multipliers.
3. **Concurrency**: Assumed synchronized lock on spot allocation in single-process or Redis distributed locks in production.`,
    rubrics: [
      { category: 'REQUIREMENTS', title: 'Functional Domain Coverage', weight: 25, description: 'Models vehicles, multi-floor spots, ticket lifecycle, and capacity display.' },
      { category: 'SOLID', title: 'SOLID & Clean Boundaries', weight: 25, description: 'Separation of concerns between physical spots, gate orchestration, and pricing calculations.' },
      { category: 'EXTENSIBILITY', title: 'Design Patterns & Abstraction', weight: 25, description: 'Use of Strategy pattern for fee calculation and spot finding; clean interfaces.' },
      { category: 'EDGE_CASES', title: 'Resilience & Concurrency Defense', weight: 25, description: 'Handles lot full, invalid tickets, and race condition considerations.' }
    ],
    benchmarks: [
      {
        id: 'bench-parking-flawed',
        title: 'Beginner Attempt (Anti-Patterns & God Class)',
        level: 'BEGINNER_FLAWED',
        description: 'Packs all logic into a single ParkingLot class with hardcoded switch statements and embedded billing.',
        rationale: 'I put all methods in ParkingLot so everything is in one place. Used switch-case for vehicle prices.',
        code: `export class ParkingLot {
  public spots: any[] = [];
  public tickets: any[] = [];

  constructor() {}

  public parkVehicle(plate: string, type: string) {
    // Hardcoded type check
    let spot = null;
    for (let s of this.spots) {
      if (!s.occupied && s.type === type) {
        s.occupied = true;
        spot = s;
        break;
      }
    }
    if (!spot) return "Lot Full";

    let ticket = { id: Math.random().toString(), plate, type, time: new Date() };
    this.tickets.push(ticket);
    return ticket;
  }

  public exitVehicle(ticketId: string) {
    let ticket = this.tickets.find(t => t.id === ticketId);
    let spot = this.spots.find(s => s.plate === ticket.plate);
    spot.occupied = false;

    // Hardcoded fee calculation inside ParkingLot violating SRP & OCP
    let hours = 2;
    let fee = 0;
    if (ticket.type === "CAR") fee = hours * 20;
    else if (ticket.type === "TRUCK") fee = hours * 50;
    else if (ticket.type === "BIKE") fee = hours * 10;
    return fee;
  }

  public addSpot(id: string, type: string) {
    this.spots.push({ id, type, occupied: false });
  }

  public getAvailableCount() {
    return this.spots.filter(s => !s.occupied).length;
  }
}`
      },
      {
        id: 'bench-parking-clean',
        title: 'Senior Staff Attempt (Clean Strategy & Inversion)',
        level: 'SENIOR_CLEAN',
        description: 'Implements Strategy pattern for fee calculation and spot allocation, clean interfaces, and full domain boundaries.',
        rationale: 'Applied Strategy pattern for IFeeCalculationStrategy and ISpotAllocationStrategy. Inverted dependencies so ParkingLot relies on abstractions.',
        code: `export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  TRUCK = 'TRUCK'
}

export interface Vehicle {
  licensePlate: string;
  type: VehicleType;
}

export class Car implements Vehicle {
  constructor(public readonly licensePlate: string) {}
  readonly type = VehicleType.CAR;
}

export class Motorcycle implements Vehicle {
  constructor(public readonly licensePlate: string) {}
  readonly type = VehicleType.MOTORCYCLE;
}

export class Truck implements Vehicle {
  constructor(public readonly licensePlate: string) {}
  readonly type = VehicleType.TRUCK;
}

export class ParkingSpot {
  private _isOccupied: boolean = false;
  private _currentVehicle?: Vehicle;

  constructor(
    public readonly id: string,
    public readonly floor: number,
    public readonly allowedType: VehicleType
  ) {}

  get isOccupied(): boolean {
    return this._isOccupied;
  }

  get currentVehicle(): Vehicle | undefined {
    return this._currentVehicle;
  }

  assignVehicle(vehicle: Vehicle): void {
    if (this._isOccupied) throw new Error(\`Spot \${this.id} is already occupied\`);
    this._currentVehicle = vehicle;
    this._isOccupied = true;
  }

  vacate(): void {
    this._currentVehicle = undefined;
    this._isOccupied = false;
  }
}

export interface Ticket {
  readonly id: string;
  readonly vehicle: Vehicle;
  readonly spot: ParkingSpot;
  readonly entryTime: Date;
}

// Open/Closed Principle: Fee calculation is an extensible strategy
export interface IFeeCalculationStrategy {
  calculateFee(ticket: Ticket, exitTime: Date): number;
}

export class HourlyRatePricingStrategy implements IFeeCalculationStrategy {
  private rates: Record<VehicleType, number> = {
    [VehicleType.MOTORCYCLE]: 10,
    [VehicleType.CAR]: 20,
    [VehicleType.TRUCK]: 50
  };

  calculateFee(ticket: Ticket, exitTime: Date): number {
    const elapsedMs = Math.max(0, exitTime.getTime() - ticket.entryTime.getTime());
    const hours = Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60)));
    return hours * this.rates[ticket.vehicle.type];
  }
}

// Strategy for spot allocation (Nearest first, Random, EV prioritized)
export interface ISpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | undefined;
}

export class FirstAvailableSpotStrategy implements ISpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | undefined {
    return spots.find(s => !s.isOccupied && s.allowedType === vehicle.type);
  }
}

export class ParkingLot {
  private spots: ParkingSpot[] = [];
  private activeTickets: Map<string, Ticket> = new Map();

  constructor(
    public readonly name: string,
    private allocationStrategy: ISpotAllocationStrategy,
    private pricingStrategy: IFeeCalculationStrategy
  ) {}

  addSpot(spot: ParkingSpot): void {
    this.spots.push(spot);
  }

  park(vehicle: Vehicle): Ticket {
    const spot = this.allocationStrategy.findSpot(this.spots, vehicle);
    if (!spot) {
      throw new Error(\`Parking Lot Full: No available spot for \${vehicle.type}\`);
    }

    spot.assignVehicle(vehicle);
    const ticket: Ticket = {
      id: \`TKT-\${Date.now()}-\${Math.floor(Math.random() * 1000)}\`,
      vehicle,
      spot,
      entryTime: new Date()
    };

    this.activeTickets.set(ticket.id, ticket);
    return ticket;
  }

  vacate(ticketId: string, exitTime: Date = new Date()): { fee: number; spotId: string } {
    const ticket = this.activeTickets.get(ticketId);
    if (!ticket) {
      throw new Error(\`Invalid Ticket ID: \${ticketId}\`);
    }

    const fee = this.pricingStrategy.calculateFee(ticket, exitTime);
    ticket.spot.vacate();
    this.activeTickets.delete(ticketId);

    return { fee, spotId: ticket.spot.id };
  }

  getAvailableCount(type?: VehicleType): number {
    return this.spots.filter(s => !s.isOccupied && (!type || s.allowedType === type)).length;
  }
}`
      }
    ]
  }),

  new Problem({
    id: 'prob-elevator-system',
    slug: 'elevator-system',
    title: 'Multi-Car Elevator Dispatcher System',
    difficulty: 'HARD',
    tags: ['State Pattern', 'Dispatcher Pattern', 'Concurrency', 'Scheduling Algorithm'],
    summary: 'Design an elevator controller managing multiple cars across a high-rise building, scheduling up/down requests with optimal movement.',
    description: `A 40-story commercial tower has 4 elevator cars. Passengers can request an elevator from any floor (hall call with UP/DOWN direction) or select destination floors from inside a car (car call).

The system must schedule cars to minimize wait times, respect car load capacities, and gracefully handle emergency stops or maintenance modes.`,
    requirements: [
      'Manage multiple Elevator cars moving between floors 1 to 40.',
      'Cars operate in states: MOVING_UP, MOVING_DOWN, IDLE, DOOR_OPEN, MAINTENANCE.',
      'Hall Call requests specify (sourceFloor, direction).',
      'Car Call requests specify (destinationFloor).',
      'Elevator Controller / Dispatcher routes calls to the optimal elevator car (e.g. SCAN / LOOK algorithm).',
      'Door safety: Car stops, doors open, wait for passengers, and close before resuming motion.'
    ],
    constraints: [
      'Capacity & Weight: Each car has a maximum weight limit. Overweight cars sound an alarm and do not move.',
      'Safety: An Emergency Stop signal must freeze car motion immediately and notify central safety.',
      'Scheduling Strategy: Dispatcher must be decoupled from individual car mechanics to allow plugging different algorithms (LOOK, FCFS, Shortest Seek).'
    ],
    expectedDomainEntities: ['ElevatorCar', 'ElevatorController', 'Request', 'Door', 'Dispatcher'],
    starterCode: {
      typescript: `// ==========================================
// ELEVATOR DISPATCHER SYSTEM - STARTER TEMPLATE
// ==========================================

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  NONE = 'NONE'
}

export enum ElevatorState {
  IDLE = 'IDLE',
  MOVING_UP = 'MOVING_UP',
  MOVING_DOWN = 'MOVING_DOWN',
  DOOR_OPEN = 'DOOR_OPEN',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Request {
  floor: number;
  direction?: Direction;
  isInternal: boolean;
}

export class ElevatorCar {
  public currentFloor: number = 1;
  public state: ElevatorState = ElevatorState.IDLE;
  public direction: Direction = Direction.NONE;

  constructor(public readonly id: string, public readonly maxCapacityKg: number = 1000) {}

  // Implement move, openDoors, addRequest
}

// TODO: Implement Dispatcher and Scheduling Strategy
export class ElevatorController {
  private cars: ElevatorCar[] = [];

  constructor() {}

  // Implement handleHallCall and step simulation
}
`
    },
    starterRationale: `### Design Decisions & Assumptions
1. **Elevator State Pattern**: Decoupled states (IDLE, MOVING, DOOR_OPEN) to prevent illegal transitions.
2. **LOOK Dispatcher Algorithm**: Elevators keep moving in the current direction until no further requests exist.
3. **Internal vs External Requests**: Differentiated hall calls from in-car target floor selections.`,
    rubrics: [
      { category: 'REQUIREMENTS', title: 'Multi-Car Dispatch Coverage', weight: 25, description: 'Models hall calls, car calls, states, and floor movement.' },
      { category: 'SOLID', title: 'Decoupled Control vs Mechanical State', weight: 25, description: 'Separates scheduling algorithm from car state and door mechanics.' },
      { category: 'EXTENSIBILITY', title: 'Pluggable Dispatch Algorithm', weight: 25, description: 'Enables switching between FCFS, LOOK, or Destination Dispatch without modifying cars.' },
      { category: 'EDGE_CASES', title: 'Safety & Direction Invariants', weight: 25, description: 'Guards against capacity violations, emergency stops, and reversing directions mid-transit.' }
    ],
    benchmarks: [
      {
        id: 'bench-elevator-flawed',
        title: 'Beginner Attempt (Elevator God Class)',
        level: 'BEGINNER_FLAWED',
        description: 'Single ElevatorController class managing all doors, algorithms, and car arrays directly.',
        rationale: 'Put everything inside ElevatorController with basic loops.',
        code: `export class ElevatorController {
  cars: any[] = [];
  requests: any[] = [];

  constructor() {}

  addRequest(floor: number, dir: string) {
    // Picks the first car always
    let car = this.cars[0];
    if (car.floor < floor) {
      car.floor = floor;
      return "Moving up";
    } else {
      car.floor = floor;
      return "Moving down";
    }
  }

  openDoor(carId: string) {
    let car = this.cars.find(c => c.id === carId);
    car.doorOpen = true;
  }
}`
      },
      {
        id: 'bench-elevator-clean',
        title: 'Senior Staff Attempt (State Machine & Pluggable Dispatcher)',
        level: 'SENIOR_CLEAN',
        description: 'Clean state machine, IDispatchStrategy abstraction, Door mechanics, and safety emergency handling.',
        rationale: 'Extracted IDispatchStrategy so scheduling algorithm is swappable. Used State pattern for car lifecycle.',
        code: `export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  IDLE = 'IDLE'
}

export enum CarState {
  IDLE = 'IDLE',
  MOVING = 'MOVING',
  DOORS_OPEN = 'DOORS_OPEN',
  EMERGENCY_STOP = 'EMERGENCY_STOP'
}

export interface Request {
  sourceFloor: number;
  destinationFloor?: number;
  direction: Direction;
}

export class Door {
  private _isOpen: boolean = false;
  get isOpen(): boolean { return this._isOpen; }
  open(): void { this._isOpen = true; }
  close(): void { this._isOpen = false; }
}

export class ElevatorCar {
  private _currentFloor: number = 1;
  private _state: CarState = CarState.IDLE;
  private _direction: Direction = Direction.IDLE;
  private _door: Door = new Door();
  private destinations: Set<number> = new Set();

  constructor(
    public readonly id: string,
    public readonly maxWeightKg: number = 800
  ) {}

  get currentFloor(): number { return this._currentFloor; }
  get state(): CarState { return this._state; }
  get direction(): Direction { return this._direction; }
  get door(): Door { return this._door; }

  addStop(floor: number): void {
    this.destinations.add(floor);
    if (this._state === CarState.IDLE) {
      this._direction = floor > this._currentFloor ? Direction.UP : Direction.DOWN;
      this._state = CarState.MOVING;
    }
  }

  step(): void {
    if (this._state === CarState.EMERGENCY_STOP) return;

    if (this.destinations.has(this._currentFloor)) {
      this._state = CarState.DOORS_OPEN;
      this._door.open();
      this.destinations.delete(this._currentFloor);
      return;
    }

    if (this._door.isOpen) {
      this._door.close();
    }

    if (this.destinations.size === 0) {
      this._state = CarState.IDLE;
      this._direction = Direction.IDLE;
      return;
    }

    if (this._direction === Direction.UP) {
      this._currentFloor++;
    } else if (this._direction === Direction.DOWN) {
      this._currentFloor--;
    }
  }

  emergencyStop(): void {
    this._state = CarState.EMERGENCY_STOP;
    this._direction = Direction.IDLE;
  }
}

export interface IDispatchStrategy {
  selectBestCar(cars: ElevatorCar[], request: Request): ElevatorCar;
}

export class LookSchedulingStrategy implements IDispatchStrategy {
  selectBestCar(cars: ElevatorCar[], request: Request): ElevatorCar {
    let bestCar = cars[0];
    let minDistance = Infinity;

    for (const car of cars) {
      if (car.state === CarState.EMERGENCY_STOP) continue;

      const dist = Math.abs(car.currentFloor - request.sourceFloor);
      const isMovingToward = (car.direction === Direction.UP && request.sourceFloor >= car.currentFloor) ||
                             (car.direction === Direction.DOWN && request.sourceFloor <= car.currentFloor) ||
                             car.state === CarState.IDLE;

      const penalty = isMovingToward ? 0 : 20;
      const score = dist + penalty;

      if (score < minDistance) {
        minDistance = score;
        bestCar = car;
      }
    }
    return bestCar;
  }
}

export class ElevatorController {
  constructor(
    private cars: ElevatorCar[],
    private dispatcher: IDispatchStrategy
  ) {}

  handleHallCall(floor: number, direction: Direction): void {
    const request: Request = { sourceFloor: floor, direction };
    const car = this.dispatcher.selectBestCar(this.cars, request);
    car.addStop(floor);
  }

  stepAll(): void {
    for (const car of this.cars) {
      car.step();
    }
  }
}`
      }
    ]
  }),

  new Problem({
    id: 'prob-vending-machine',
    slug: 'vending-machine',
    title: 'Vending Machine State Architecture',
    difficulty: 'EASY',
    tags: ['State Pattern', 'Inventory Management', 'Coin Dispenser'],
    summary: 'Design a state-driven vending machine handling product inventory, money insertion, exact change calculation, and physical dispensing.',
    description: `A vending machine sells beverages and snacks. Customers select an item, insert coins/bills, receive the item, and collect their change.

The machine must maintain a strict state machine (NoMoney $\to$ HasMoney $\to$ Dispensing $\to$ SoldOut) to prevent theft or illegal item releases.`,
    requirements: [
      'Maintain an inventory of items with slot codes (e.g. A1, B2), prices, and stock counts.',
      'Accept currency denominations: DIME ($0.10), QUARTER ($0.25), DOLLAR ($1.00), FIVE ($5.00).',
      'Support state transitions: IDLE, HAS_MONEY, DISPENSING, SOLD_OUT.',
      'Cancel transaction: If the user presses cancel, refund all inserted money and return to IDLE.',
      'Dispense item and calculate minimal change in coins from internal change cash box.'
    ],
    constraints: [
      'Invariant: An item cannot be dispensed if inserted balance is less than product price.',
      'Insufficient Change: If the machine lacks exact change coins, reject transaction and refund money.',
      'State Pattern: Use explicit State objects for each machine phase rather than nested if-else statements.'
    ],
    expectedDomainEntities: ['VendingMachine', 'Inventory', 'Item', 'Coin', 'State'],
    starterCode: {
      typescript: `// ==========================================
// VENDING MACHINE - STARTER TEMPLATE
// ==========================================

export enum Coin {
  DIME = 0.10,
  QUARTER = 0.25,
  DOLLAR = 1.00
}

export interface Item {
  code: string;
  name: string;
  price: number;
}

export interface IVendingMachineState {
  insertCoin(coin: Coin): void;
  selectItem(code: string): void;
  dispense(): void;
  cancel(): void;
}

export class VendingMachine {
  private currentBalance: number = 0;
  // TODO: Implement state instances and inventory
}
`
    },
    starterRationale: `### Design Decisions & Assumptions
1. **State Pattern**: Implemented IVendingMachineState with IdleState, HasMoneyState, and DispensingState.
2. **Greedy Change Dispensing**: Calculates return change from largest coin denomination down to smallest.`,
    rubrics: [
      { category: 'REQUIREMENTS', title: 'State & Inventory Operations', weight: 25, description: 'Covers coin insertion, inventory tracking, dispensing, and refund.' },
      { category: 'SOLID', title: 'State Pattern Separation', weight: 25, description: 'Each machine state encapsulates its valid transitions and operations.' },
      { category: 'EXTENSIBILITY', title: 'New Payment & Currency Methods', weight: 25, description: 'Can introduce contactless payments or new coins without refactoring state classes.' },
      { category: 'EDGE_CASES', title: 'Exact Change & Out-of-Stock Guard', weight: 25, description: 'Handles sold out items, insufficient change, and transaction aborts.' }
    ],
    benchmarks: []
  }),

  new Problem({
    id: 'prob-splitwise-expense',
    slug: 'splitwise-expense-sharing',
    title: 'Splitwise Expense Sharing Platform',
    difficulty: 'MEDIUM',
    tags: ['Strategy Pattern', 'Balance Sheet', 'Debt Simplification'],
    summary: 'Design an expense-sharing service where friends record group expenses, split costs by equal/exact/percentage strategies, and settle balances.',
    description: `Friends living together or traveling share expenses (rent, groceries, dinner). One person pays the bill, and the amount is split among members.

The platform tracks balances between every pair of users and allows settling debts.`,
    requirements: [
      'Manage Users with unique ID, name, email, and mobile number.',
      'Create Groups and manage group memberships.',
      'Record Expenses paid by one user on behalf of multiple users.',
      'Support multiple Split Strategies: EQUAL split, EXACT amount split, and PERCENTAGE split.',
      'Display User Balance Sheet showing who owes whom how much.'
    ],
    constraints: [
      'Split Validation: For EXACT splits, parts must sum to total. For PERCENTAGE splits, percentages must sum to 100%.',
      'Extensibility: Adding a new split strategy (e.g. SHARES or DYNAMIC WEIGHTS) must not modify the ExpenseService class.'
    ],
    expectedDomainEntities: ['User', 'Expense', 'Group', 'Split', 'SplitStrategy'],
    starterCode: {
      typescript: `// ==========================================
// SPLITWISE EXPENSE SHARING - STARTER TEMPLATE
// ==========================================

export interface User {
  id: string;
  name: string;
}

export enum SplitType {
  EQUAL = 'EQUAL',
  EXACT = 'EXACT',
  PERCENTAGE = 'PERCENTAGE'
}

export interface Split {
  user: User;
  amount: number;
}

// TODO: Implement ISplitStrategy, Expense, and ExpenseService
export class ExpenseService {
  // Implement addExpense and showBalances
}
`
    },
    starterRationale: `### Design Decisions & Assumptions
1. **Strategy Pattern**: Extracted ISplitStrategy with EqualSplitStrategy, ExactSplitStrategy, and PercentageSplitStrategy.
2. **Directed Balance Graph**: User A owes User B is stored in a bidirectional ledger.`,
    rubrics: [
      { category: 'REQUIREMENTS', title: 'Expense & Split Coverage', weight: 25, description: 'Tracks users, expense creation, split calculations, and balance tracking.' },
      { category: 'SOLID', title: 'Strategy Pattern on Splits', weight: 25, description: 'Extracts split validation and computation into dedicated strategy classes.' },
      { category: 'EXTENSIBILITY', title: 'Pluggable Split Formats', weight: 25, description: 'Allows new split rules (shares, adjustments) without modifying core accounting.' },
      { category: 'EDGE_CASES', title: 'Rounding & Zero-Sum Invariants', weight: 25, description: 'Guards against rounding penny errors and mismatched percentages.' }
    ],
    benchmarks: []
  })
];
