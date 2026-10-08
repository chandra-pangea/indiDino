// Request body for adding a product to the cart.
import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class AddCartItemDto {
  // Id of the product to add.
  @IsString()
  @IsNotEmpty()
  productId!: string;

  // How many units to add (defaults to 1 in the service if omitted).
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
