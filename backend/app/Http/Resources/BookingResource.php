<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $voucher = optional($this->voucherHistory)->voucher;

        $discount = $voucher->discount_value ?? 0;
        $voucherCode = $voucher->code ?? null;

        $subtotal = (float) $this->total_price;
        $total = $subtotal - $discount;
        $total = $total < 0 ? 0 : $total;

        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'start_datetime' => $this->start_datetime->toIso8601String(),
            'end_datetime' => $this->end_datetime->toIso8601String(),
            'date' => Carbon::parse($this->start_datetime)->format('F j, Y'),
            'time_range' => Carbon::parse($this->start_datetime)->format('g:i A') . ' - ' . Carbon::parse($this->end_datetime)->format('g:i A'),
            'subtotal' => number_format($subtotal, 2),
            'discount' => number_format($discount, 2),
            'total_price' => number_format($total, 2),
            'points_earned' => floor($total),
            'venue' => [
                'id' => $this->court->venue->id,
                'name' => $this->court->venue->name,
                'address' => $this->court->venue->address,
                'state' => $this->court->venue->state->name,
            ],
            'court' => [ 'name' => $this->court->name ],
            'voucher_code_applied' => $voucherCode,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
            'created_at' => $this->created_at,
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'activity' => new ActivityResource($this->whenLoaded('activity')),
        ];
    }
}