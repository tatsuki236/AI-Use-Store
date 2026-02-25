"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSeller, updateSellerRegistration } from "./actions";

type SellerProfile = {
  full_name: string;
  address: string;
  phone: string;
  date_of_birth: string;
};

export function SellerRegistrationForm({
  existing,
}: {
  existing?: SellerProfile;
}) {
  const action = existing ? updateSellerRegistration : registerSeller;

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">氏名</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={existing?.full_name}
            placeholder="山田 太郎"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">生年月日</Label>
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            required
            defaultValue={existing?.date_of_birth}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">住所</Label>
        <Input
          id="address"
          name="address"
          required
          defaultValue={existing?.address}
          placeholder="東京都渋谷区..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={existing?.phone}
          placeholder="090-1234-5678"
        />
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        {existing ? "再申請する" : "出品者登録を申請する"}
      </Button>
    </form>
  );
}
