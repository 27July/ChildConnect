export interface AuthStrategy {
  login(email: string, password: string): Promise<string>; // returns token
}
