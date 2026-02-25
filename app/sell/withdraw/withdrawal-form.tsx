"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestWithdrawal } from "./actions";

type Props = {
  requiresVerification: boolean;
  existingBank?: {
    bank_name: string;
    branch_name: string;
    account_number: string;
    account_holder_name: string;
  } | null;
};

export function WithdrawalForm({ requiresVerification, existingBank }: Props) {
  return (
    <form action={requestWithdrawal} className="space-y-6 max-w-2xl">
      {/* 出金額 */}
      <div className="space-y-2">
        <Label htmlFor="amount">出金額 (円)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={1}
          required
          placeholder="1000"
        />
      </div>

      {/* 口座情報 */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">口座情報</h2>
        {!requiresVerification && existingBank && (
          <p className="text-sm text-muted-foreground">
            前回と同じ口座情報が入力されています。変更がある場合は修正してください。
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">銀行名</Label>
            <Input
              id="bank_name"
              name="bank_name"
              required
              defaultValue={existingBank?.bank_name}
              placeholder="三菱UFJ銀行"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch_name">支店名</Label>
            <Input
              id="branch_name"
              name="branch_name"
              required
              defaultValue={existingBank?.branch_name}
              placeholder="渋谷支店"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account_number">口座番号</Label>
            <Input
              id="account_number"
              name="account_number"
              required
              defaultValue={existingBank?.account_number}
              placeholder="1234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_holder_name">口座名義</Label>
            <Input
              id="account_holder_name"
              name="account_holder_name"
              required
              defaultValue={existingBank?.account_holder_name}
              placeholder="ヤマダ タロウ"
            />
          </div>
        </div>
      </section>

      {/* 身分証（初回 or 情報変更時のみ必須） */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">身分証明書</h2>
        {requiresVerification ? (
          <div className="space-y-2">
            <p className="text-sm text-amber-600 font-medium">
              {existingBank
                ? "住所などの情報が変更されたため、再度身分証の提出が必要です。"
                : "初回の出金申請のため、身分証の提出が必要です。"}
            </p>
            <Label htmlFor="id_document">
              身分証の画像（運転免許証・マイナンバーカード等）
            </Label>
            <Input
              id="id_document"
              name="id_document"
              type="file"
              accept="image/*,.pdf"
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              前回の確認済み身分証が有効です。変更がある場合のみアップロードしてください。
            </p>
            <Label htmlFor="id_document">
              身分証の画像（変更がある場合のみ）
            </Label>
            <Input
              id="id_document"
              name="id_document"
              type="file"
              accept="image/*,.pdf"
            />
          </div>
        )}
      </section>

      <Button type="submit" className="w-full sm:w-auto">
        出金を申請する
      </Button>
    </form>
  );
}
