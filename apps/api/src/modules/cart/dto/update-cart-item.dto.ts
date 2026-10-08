// Request body for setting the quantity of a cart line item.
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  // New absolute quantity for the product (0 removes it).
  @IsInt()
  @Min(0)
  quantity!: number;
}
