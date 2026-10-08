// Request body for creating a coin-purchase payment intent.
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentDto {
  // Id of the coin package the user is buying.
  @IsString()
  @IsNotEmpty()
  coinPackageId!: string;
}
