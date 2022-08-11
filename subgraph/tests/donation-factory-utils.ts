import { newMockEvent } from "matchstick-as";
import { log } from "matchstick-as/assembly/log";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  DonationCreated,
  UserDonated,
  WhaleFunded,
} from "../generated/DonationFactory/DonationFactory";

export function createDonationCreatedEvent(
  donation: Address,
  whale: Address,
  index: BigInt
): DonationCreated {
  let donationCreatedEvent = changetype<DonationCreated>(newMockEvent());

  donationCreatedEvent.parameters = new Array();

  donationCreatedEvent.parameters.push(
    new ethereum.EventParam("donation", ethereum.Value.fromAddress(donation))
  );
  donationCreatedEvent.parameters.push(
    new ethereum.EventParam("whale", ethereum.Value.fromAddress(whale))
  );
  donationCreatedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  );

  return donationCreatedEvent;
}

export function createUserDonatedEvent(
  user: Address,
  donation: Address,
  amount: BigInt
): UserDonated {
  let userDonatedEvent = changetype<UserDonated>(newMockEvent());

  userDonatedEvent.parameters = new Array();

  userDonatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  );
  userDonatedEvent.parameters.push(
    new ethereum.EventParam("donation", ethereum.Value.fromAddress(donation))
  );
  userDonatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  );

  return userDonatedEvent;
}

export function createWhaleFundedEvent(
  whale: Address,
  donation: Address,
  amount: BigInt
): WhaleFunded {
  let whaleFundedEvent = changetype<WhaleFunded>(newMockEvent());

  whaleFundedEvent.parameters = new Array();

  whaleFundedEvent.parameters.push(
    new ethereum.EventParam("whale", ethereum.Value.fromAddress(whale))
  );
  whaleFundedEvent.parameters.push(
    new ethereum.EventParam("donation", ethereum.Value.fromAddress(donation))
  );
  whaleFundedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  );

  return whaleFundedEvent;
}
