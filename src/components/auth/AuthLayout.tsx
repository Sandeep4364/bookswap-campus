import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BookSwap</h1>
          <p className="text-white/80">Save Money. Share Knowledge. Sustain Education.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-medium p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;