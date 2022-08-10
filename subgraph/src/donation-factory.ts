import { BigInt } from "@graphprotocol/graph-ts";
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
  }

  entity.donations.push(event.params.donation.toString());
  entity.whales.push(event.params.whale.toString());

  entity.save();
}

export function handleUserDonated(event: UserDonated): void {
  let useraddr = event.params.user.toString();
  let entity = User.load(useraddr);

  if (!entity) {
    entity = new User(useraddr);

    entity.total = BigInt.fromI32(0);
  }

  entity.donations.push(event.params.donation.toString());
  entity.amount.push(event.params.amount);
  entity.total.plus(event.params.amount);

  entity.save();
}

export function handleWhaleFunded(event: WhaleFunded): void {
  let whaleaddr = event.params.whale.toString();
  let entity = Whale.load(whaleaddr);

  if (!entity) {
    entity = new Whale(whaleaddr);

    entity.total = BigInt.fromI32(0);
  }

  entity.donations.push(event.params.donation.toString());
  entity.amount.push(event.params.amount);
  entity.total.plus(event.params.amount);

  entity.save();
}
