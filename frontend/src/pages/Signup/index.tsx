import { Mail, UserPlus, Users, Lock, LockKeyhole } from "lucide-react";

import { useSignup } from "../../hooks/useSignup";
import FormInput from "../../components/FormInput";

const SignUp = () => {
  const { signupForm, onFormChange, onLogin, onSignupSubmit } = useSignup();
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-2xl border border-indigo-100/50">
      <div className="flex items-center mb-8 border-b pb-4">
        <UserPlus className="w-7 h-7 mr-2 text-indigo-600" />
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
          Sign up
        </h2>
      </div>
      <form className="space-y-6">
        <FormInput
          type="email"
          name="email"
          value={signupForm.email}
          onChange={onFormChange}
          placeholder="Email Address"
          icon={Mail}
          message="Email already exist"
          required
        />
        <FormInput
          type="text"
          name="username"
          value={signupForm.username}
          onChange={onFormChange}
          placeholder="Username"
          icon={Users}
          required
        />
        <FormInput
          type="password"
          name="password"
          value={signupForm.password}
          onChange={onFormChange}
          placeholder="Password (min 6 characters)"
          icon={Lock}
          required
        />
        <FormInput
          type="password"
          name="confirmPassword"
          value={signupForm.confirmPassword}
          onChange={onFormChange}
          placeholder="Confirm Password"
          icon={LockKeyhole}
          required
        />
      </form>
      <button onClick={onSignupSubmit} className="w-full p-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center disabled:bg-indigo-400 disabled:cursor-not-allowed">
        Sign In
      </button>
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={onLogin}
            className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors mt-4"
          >
            Already have an account? Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
