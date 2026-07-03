export const toFormData = (values) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (typeof value === "number" && Number.isNaN(value)) {
      return;
    }

    if (value instanceof FileList) {
      if (value[0]) {
        formData.append(key, value[0]);
      }
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, typeof value === "boolean" ? String(value) : value);
  });

  return formData;
};
