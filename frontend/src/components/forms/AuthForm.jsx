import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../../services/api";
import { useAppStore } from "../../store/useAppStore";
import { Button, FieldError, FieldHint, Input, Label } from "../ui";

const buildSchema = (mode) =>
  z.object({
    name: mode === "register" ? z.string().trim().min(2, "Vui lòng nhập họ tên.") : z.string().optional(),
    email: z.string().trim().email("Email không hợp lệ."),
    password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự."),
    phone: mode === "register" ? z.string().trim().min(8, "Số điện thoại không hợp lệ.") : z.string().optional(),
    address: mode === "register" ? z.string().trim().min(6, "Vui lòng nhập địa chỉ.") : z.string().optional()
  });

const AuthForm = ({ mode = "login", onSuccess }) => {
  const setSession = useAppStore((state) => state.setSession);
  const [serverError, setServerError] = useState("");
  const schema = useMemo(() => buildSchema(mode), [mode]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: ""
    }
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const response =
        mode === "register"
          ? await authApi.register(values)
          : await authApi.login({
              email: values.email,
              password: values.password
            });

      setSession({
        token: response.token,
        user: response.user
      });
      onSuccess?.(response.user);
    } catch (error) {
      setServerError(error.message || "Không thể xác thực tài khoản.");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {mode === "register" ? (
        <>
          <div>
            <Label>Họ tên</Label>
            <Input placeholder="Ví dụ: Nguyễn Thu An" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input placeholder="0909..." {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div>
            <Label>Địa chỉ</Label>
            <Input placeholder="Quận 1, TP.HCM" {...register("address")} />
            <FieldError message={errors.address?.message} />
          </div>
        </>
      ) : null}

      <div>
        <Label>Email</Label>
        <Input type="email" placeholder="you@example.com" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label>Mật khẩu</Label>
        <Input type="password" placeholder="Tối thiểu 8 ký tự" {...register("password")} />
        <FieldError message={errors.password?.message} />
        {mode === "register" ? (
          <FieldHint>Gợi ý: dùng ít nhất 1 chữ in hoa và 1 chữ số.</FieldHint>
        ) : null}
      </div>

      {serverError ? <FieldError message={serverError} /> : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang xử lý..." : mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}
      </Button>
    </form>
  );
};

export default AuthForm;

