import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { log } from "matchstick-as/assembly/log";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { Donations, User } from "../generated/schema";
import { DonationCreated } from "../generated/DonationFactory/DonationFactory";
import {
  handleDonationCreated,
  handleUserDonated,
} from "../src/donation-factory";
import {
  createDonationCreatedEvent,
  createUserDonatedEvent,
} from "./donation-factory-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Check Donation Creation", () => {
  beforeAll(() => {
    let donation = Address.fromString(
      "0x0000000000000000000000000000000000000DDD"
    );
    let whale = Address.fromString(
      "0x0000000000000000000000000000000000000BBB"
    );
    let index = BigInt.fromI32(0);
    let newDonationCreatedEvent = createDonationCreatedEvent(
      donation,
      whale,
      index
    );
    handleDonationCreated(newDonationCreatedEvent);

    let user = Address.fromString("0x0000000000000000000000000000000000000aaa");
    let newUserDonatedEvent = createUserDonatedEvent(
      user,
      donation,
      BigInt.fromI32(100)
    );
    handleUserDonated(newUserDonatedEvent);

    let user2 = Address.fromString(
      "0x0000000000000000000000000000000000000ccc"
    );
    log.debug("user2 ", [user2.toString()]);
    let user2UserDonatedEvent = createUserDonatedEvent(
      user2,
      donation,
      BigInt.fromI32(100)
    );
    handleUserDonated(user2UserDonatedEvent);
  });

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Donations created and stored", () => {
    assert.entityCount("Donations", 1);
    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals("Donations", "DonationFactory", "id", "DonationFactory");
    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  });

  test("User created and stored", () => {
    assert.entityCount("User", 2);
    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "User",
      "0x0000000000000000000000000000000000000aaa",
      "total",
      BigInt.fromI32(100).toString()
    );
    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  });
});
