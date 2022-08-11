import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import {
  DonationFactory,
  DonationCreated,
  UserDonated,
  WhaleFunded,
} from "../generated/DonationFactory/DonationFactory";
import { Donations, User, Whale } from "../generated/schema";

export function handleDonationCreated(event: DonationCreated): void {
  let uniqueID: string = "DonationFactory";
  let entity = Donations.load(uniqueID);

  if (!entity) {
    entity = new Donations(uniqueID);

    entity.donations = new Array<Bytes>();
    entity.whales = new Array<Bytes>();
  }

  let donations = entity.donations;
  donations.push(event.params.donation);
  entity.donations = donations;

  let whales = entity.whales;
  whales.push(event.params.whale);
  entity.whales = whales;

  entity.save();
}

export function handleUserDonated(event: UserDonated): void {
  let useraddr = event.params.user.toHex();
  let entity = User.load(useraddr);

  if (!entity) {
    entity = new User(useraddr);

    entity.donations = new Array<Bytes>();
    entity.amount = new Array<BigInt>();
    entity.total = BigInt.fromI32(0);
  }

  let donations = entity.donations;
  donations.push(event.params.donation);
  entity.donations = donations;

  let amount = entity.amount;
  amount.push(event.params.amount);
  entity.amount = amount;
  entity.total = entity.total + event.params.amount;

  entity.save();
}

export function handleWhaleFunded(event: WhaleFunded): void {
  let whaleaddr = event.params.whale.toHex();
  let entity = Whale.load(whaleaddr);

  if (!entity) {
    entity = new Whale(whaleaddr);

    entity.donations = new Array<Bytes>();
    entity.amount = new Array<BigInt>();
    entity.total = BigInt.fromI32(0);
  }

  let donations = entity.donations;
  donations.push(event.params.donation);
  entity.donations = donations;

  let amount = entity.amount;
  amount.push(event.params.amount);
  entity.amount = amount;
  entity.total = entity.total + event.params.amount;

  entity.save();
}
