import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Checkbox, DataTable, FieldError, FieldHint, Input, Label, Select, Textarea } from "../ui";

const renderField = ({ field, register, control, errors }) => {
  if (field.type === "textarea") {
    return (
      <>
        <Textarea rows={field.rows ?? 4} placeholder={field.placeholder} {...register(field.name)} />
        <FieldError message={errors[field.name]?.message} />
      </>
    );
  }

  if (field.type === "select") {
    return (
      <>
        <Select {...register(field.name)}>
          <option value="">{field.placeholder || "Chọn một giá trị"}</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <FieldError message={errors[field.name]?.message} />
      </>
    );
  }

  if (field.type === "multiselect") {
    return (
      <Controller
        control={control}
        name={field.name}
        render={({ field: controllerField }) => (
          <>
            <div className="grid gap-3 rounded-3xl border border-rose/10 bg-white/75 p-4">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-start gap-3 rounded-2xl bg-white/80 p-3">
                  <Checkbox
                    checked={controllerField.value?.includes(option.value) ?? false}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...(controllerField.value ?? []), option.value]
                        : (controllerField.value ?? []).filter((value) => value !== option.value);
                      controllerField.onChange(next);
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">{option.label}</p>
                    {option.description ? (
                      <p className="mt-1 text-xs leading-6 text-cocoa/70">{option.description}</p>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
            <FieldError message={errors[field.name]?.message} />
          </>
        )}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl bg-white/75 p-3">
        <Checkbox {...register(field.name)} />
        <span className="text-sm font-medium text-cocoa">{field.checkboxLabel || field.label}</span>
      </label>
    );
  }

  if (field.type === "file") {
    return (
      <>
        <Input type="file" accept={field.accept ?? "image/*"} {...register(field.name)} />
        <FieldHint>{field.hint || "Bạn có thể để trống nếu dùng URL ảnh có sẵn."}</FieldHint>
      </>
    );
  }

  return (
    <>
      <Input
        type={field.type === "number" ? "number" : "text"}
        step={field.step}
        min={field.min}
        placeholder={field.placeholder}
        {...register(field.name, field.type === "number" ? { valueAsNumber: true } : undefined)}
      />
      <FieldError message={errors[field.name]?.message} />
    </>
  );
};

const AdminResourcePage = ({
  title,
  description,
  formSchema,
  defaultValues,
  fields,
  columns,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  transformIn = (item) => item,
  transformOut = (values) => values,
  emptyTitle,
  emptyDescription
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const serviceOptionsHash = useMemo(() => JSON.stringify(fields.map((field) => field.name)), [fields]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await loadItems();
      setItems(response.items ?? response.item ?? []);
    } catch (error) {
      setServerError(error.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [serviceOptionsHash]);

  const cancelEdit = () => {
    setEditingItem(null);
    reset(defaultValues);
  };

  const submit = async (values) => {
    setServerError("");
    try {
      const payload = transformOut(values);
      if (editingItem) {
        await updateItem(editingItem.id, payload);
      } else {
        await createItem(payload);
      }
      cancelEdit();
      await refresh();
    } catch (error) {
      setServerError(error.message || "Không thể lưu dữ liệu.");
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    reset({
      ...defaultValues,
      ...transformIn(item)
    });
  };

  const remove = async (item) => {
    const confirmed = window.confirm(`Bạn muốn lưu trữ/xóa "${item.name || item.code || item.email}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteItem(item.id);
      await refresh();
    } catch (error) {
      setServerError(error.message || "Không thể xóa dữ liệu.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="h-fit">
        <div className="eyebrow">{editingItem ? "Chỉnh sửa" : "Thêm mới"}</div>
        <h2 className="mt-4 text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-cocoa/80">{description}</p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)}>
          {fields.map((field) => (
            <div key={field.name}>
              {field.type !== "checkbox" ? <Label>{field.label}</Label> : null}
              {renderField({ field, register, control, errors })}
              {field.helpText ? <FieldHint>{field.helpText}</FieldHint> : null}
            </div>
          ))}

          {serverError ? <FieldError message={serverError} /> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : editingItem ? "Cập nhật" : "Tạo mới"}
            </Button>
            {editingItem ? (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Hủy chỉnh sửa
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="eyebrow">Danh sách</div>
              <h3 className="mt-3 text-2xl">Quản lý hiện có</h3>
            </div>
            <Button variant="secondary" onClick={refresh}>
              Tải lại
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card className="text-center text-sm text-cocoa/75">Đang tải dữ liệu...</Card>
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            actions={(row) => (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>
                  Sửa
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(row)}>
                  Xóa
                </Button>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default AdminResourcePage;

