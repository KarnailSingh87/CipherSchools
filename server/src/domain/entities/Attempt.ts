import { SubmissionStatus, SubmissionPayload, EvaluationResult } from '../types.js';

export interface AttemptProps {
  id: string;
  problemId: string;
  version: number;
  submission: SubmissionPayload;
  status?: SubmissionStatus;
  result?: EvaluationResult;
  error?: string;
  createdAt?: Date;
  completedAt?: Date;
}

export class Attempt {
  readonly id: string;
  readonly problemId: string;
  readonly version: number;
  readonly submission: SubmissionPayload;
  private _status: SubmissionStatus;
  private _result?: EvaluationResult;
  private _error?: string;
  readonly createdAt: Date;
  private _completedAt?: Date;

  constructor(props: AttemptProps) {
    this.id = props.id;
    this.problemId = props.problemId;
    this.version = props.version;
    this.submission = props.submission;
    this._status = props.status ?? 'PENDING';
    this._result = props.result;
    this._error = props.error;
    this.createdAt = props.createdAt ?? new Date();
    this._completedAt = props.completedAt;
  }

  get status(): SubmissionStatus {
    return this._status;
  }

  get result(): EvaluationResult | undefined {
    return this._result;
  }

  get error(): string | undefined {
    return this._error;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  updateStatus(newStatus: SubmissionStatus): void {
    this._status = newStatus;
  }

  complete(result: EvaluationResult): void {
    this._result = result;
    this._status = 'COMPLETED';
    this._completedAt = new Date();
  }

  fail(errorMessage: string): void {
    this._error = errorMessage;
    this._status = 'FAILED';
    this._completedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      version: this.version,
      submission: this.submission,
      status: this._status,
      result: this._result,
      error: this._error,
      createdAt: this.createdAt.toISOString(),
      completedAt: this._completedAt?.toISOString()
    };
  }
}
