type MaybeDocument = {
  toObject?: () => Record<string, unknown>;
};

export const sanitizeUser = <T extends object>(user: T): Omit<T, "password"> => {
  const document = user as MaybeDocument;
  const source =
    typeof document.toObject === "function"
      ? document.toObject()
      : (user as Record<string, unknown>);

  const safe = { ...source };
  delete safe.password;

  return safe as unknown as Omit<T, "password">;
};
