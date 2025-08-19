declare module 'bcryptjs' {
  const bcrypt: {
    genSaltSync(rounds?: number): string;
    hashSync(s: string, salt: string | number): string;
    compareSync(s: string, hash: string): boolean;
    // funções assíncronas (promises/callbacks)
    genSalt(rounds: number, callback: (err: Error | null, salt: string) => void): void;
    genSalt(rounds: number): Promise<string>;
    hash(
      s: string,
      salt: string | number,
      callback?: (err: Error | null, hash: string) => void
    ): void | Promise<string>;
    compare(
      s: string,
      hash: string,
      callback?: (err: Error | null, res: boolean) => void
    ): void | Promise<boolean>;
  };

  export default bcrypt;
}
