// @ts-ignore
abstract class Modlet {
  abstract modInfo: { [index in "file" | "folder" | "xml" | "raw"]: string };
  abstract enable(enabled: boolean): void;
  abstract errors(): string[];
  abstract get(key: string): string;
  abstract isEnabled(): boolean;
  abstract isValid(): boolean;
  abstract isValidXML(): boolean;
  abstract validate(gameFolder: string): PromiseLike<any>;
}

interface IModletState {
  modlet: Modlet;
  validated: boolean;
}

interface IState {
  advancedMode: boolean;
  config: any;
  gameFolder: string | null;
  modletFolder: string | null;
  modlets: IModletState[];
}
