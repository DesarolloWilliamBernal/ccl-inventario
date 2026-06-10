export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
  expiraEn: string;
}
