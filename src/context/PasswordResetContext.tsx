import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface PasswordResetContextValue {
  email: string;
  otp: string;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  clearResetState: () => void;
}

const PasswordResetContext =
  createContext<PasswordResetContextValue | null>(null);

export const PasswordResetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const value = useMemo(
    () => ({
      email,
      otp,
      setEmail,
      setOtp,
      clearResetState: () => {
        setEmail("");
        setOtp("");
      },
    }),
    [email, otp],
  );

  return (
    <PasswordResetContext.Provider value={value}>
      {children}
    </PasswordResetContext.Provider>
  );
};

export const usePasswordReset = () => {
  const context = useContext(PasswordResetContext);

  if (!context) {
    throw new Error(
      "usePasswordReset must be used within a PasswordResetProvider.",
    );
  }

  return context;
};
