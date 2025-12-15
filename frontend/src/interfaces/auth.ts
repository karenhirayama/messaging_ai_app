export interface LoginForm {
  email: string;
  password: string;
}

export const defaultLoginForm: LoginForm = {
  email: "",
  password: "",
};

export interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const defaultSignupForm: SignupForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};