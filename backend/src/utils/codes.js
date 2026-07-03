const randomDigits = () => Math.floor(1000 + Math.random() * 9000);

export const generateCode = (prefix) => {
  const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${dateSegment}-${randomDigits()}`;
};

