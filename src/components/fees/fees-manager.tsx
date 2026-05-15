"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collectPayment } from "@/actions/fees";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@prisma/client";
import type { PaginationMeta } from "@/types";

interface Fee {
  id: string;
  amount: number;
  discount: number;
  fine: number;
  dueDate: Date;
  status: string;
  student: {
    user: { name: string };
    section: { name: string; class: { name: string } } | null;
  };
  feeStructure: { name: string };
  payments: Array<{ amount: number; paidAt: Date }>;
}

interface FeesManagerProps {
  initialFees: Fee[];
  stats: {
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    recentPayments: Array<{
      id: string;
      amount: number;
      paidAt: Date;
      fee: {
        student: { user: { name: string } };
        feeStructure: { name: string };
      };
    }>;
  };
  meta: PaginationMeta;
}

const statusConfig = {
  PENDING: { label: "Pending", variant: "warning" as const },
  PAID: { label: "Paid", variant: "success" as const },
  OVERDUE: { label: "Overdue", variant: "destructive" as const },
  PARTIAL: { label: "Partial", variant: "info" as const },
};

export function FeesManager({ initialFees, stats, meta }: FeesManagerProps) {
  const router = useRouter();
  const [fees] = useState(initialFees);
  const [collectingFee, setCollectingFee] = useState<Fee | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "CASH" as PaymentMethod,
    transactionId: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const handleCollect = async () => {
    if (!collectingFee || !paymentForm.amount) return;
    setSaving(true);
    try {
      const result = await collectPayment({
        feeId: collectingFee.id,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        transactionId: paymentForm.transactionId || undefined,
        note: paymentForm.note || undefined,
      });

      if (result.success) {
        toast.success("Payment collected successfully");
        setCollectingFee(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to collect payment");
      }
    } finally {
      setSaving(false);
    }
  };

  const getPaidAmount = (fee: Fee) =>
    fee.payments.reduce((sum, p) => sum + p.amount, 0);

  const getRemainingAmount = (fee: Fee) =>
    fee.amount + fee.fine - fee.discount - getPaidAmount(fee);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Total Collected",
            value: formatCurrency(stats.totalCollected),
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            title: "Pending",
            value: formatCurrency(stats.totalPending),
            icon: AlertCircle,
            color: "text-yellow-600",
            bg: "bg-yellow-50 dark:bg-yellow-950",
          },
          {
            title: "Overdue",
            value: formatCurrency(stats.totalOverdue),
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-950",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      No fee records found
                    </td>
                  </tr>
                ) : (
                  fees.map((fee, i) => {
                    const paid = getPaidAmount(fee);
                    const remaining = getRemainingAmount(fee);
                    const config = statusConfig[fee.status as keyof typeof statusConfig];
                    return (
                      <motion.tr
                        key={fee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{fee.student.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {fee.student.section?.class.name} - {fee.student.section?.name}
                          </p>
                        </td>
                        <td className="px-4 py-3">{fee.feeStructure.name}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(fee.amount)}</td>
                        <td className="px-4 py-3">
                          <span className="text-green-600 font-medium">{formatCurrency(paid)}</span>
                          {remaining > 0 && (
                            <p className="text-xs text-red-500">Due: {formatCurrency(remaining)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDate(fee.dueDate)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={config?.variant || "outline"}>
                            {config?.label || fee.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {fee.status !== "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCollectingFee(fee);
                                setPaymentForm({
                                  amount: remaining.toString(),
                                  method: "CASH",
                                  transactionId: "",
                                  note: "",
                                });
                              }}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Collect
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Collect Payment Dialog */}
      <Dialog open={!!collectingFee} onOpenChange={() => setCollectingFee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          {collectingFee && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><span className="font-medium">Student:</span> {collectingFee.student.user.name}</p>
                <p><span className="font-medium">Fee:</span> {collectingFee.feeStructure.name}</p>
                <p><span className="font-medium">Remaining:</span> {formatCurrency(getRemainingAmount(collectingFee))}</p>
              </div>

              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(v) => setPaymentForm((p) => ({ ...p, method: v as PaymentMethod }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transaction ID (optional)</Label>
                <Input
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, transactionId: e.target.value }))}
                  placeholder="Transaction reference"
                />
              </div>

              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <Input
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Additional notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectingFee(null)}>Cancel</Button>
            <Button onClick={handleCollect} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                "Collect Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
