const chai = require('chai');
const expect = chai.expect;
const randomNumber = require('random-number-csprng');
const { createLootTable, createItem } = require('../index');

describe('Create loot tables and Loot', () => {
  it('Create all entries', done => {
    CreateAllEntries().then(() => {
      console.log('Items created');
      done();
    });
  });
  it('Drop All Loots', done => {
    DropLoots().then(() => {
      console.log('All Loots dropped');
      done();
    });
  });
});
let chestOne, chestTwo, megaChest, equipmentTable;

async function CreateAllEntries() {
  let gold = createItem('gold');
  let silver = createItem('silver');
  let sword = createItem('sword');
  let helmet = createItem('helmet');
  let dropCount = await randomNumber(1, 2);
  chestOne = createLootTable('gold chest', dropCount);
  dropCount = await randomNumber(1, 2);
  chestTwo = createLootTable('silver chest', dropCount);
  dropCount = await randomNumber(1, 2);
  megaChest = createLootTable('mega chest', dropCount);
  dropCount = await randomNumber(1, 2);
  equipmentTable = createLootTable('equipments', dropCount);

  equipmentTable.add(sword, { isUnique: true });
  equipmentTable.add(helmet, { isUnique: true });

  expect(equipmentTable).to.be.not.null;
  expect(equipmentTable).to.have.property('name');
  expect(equipmentTable._itemEntries).to.be.an('array');

  chestOne.add(gold, { isAlways: true, minStack: 10, maxStack: 50 });
  chestOne.add(equipmentTable, { weight: 8, isUnique: true });

  expect(chestOne).to.be.not.null;
  expect(chestOne).to.have.property('name');
  expect(chestOne._itemEntries).to.be.an('array');

  chestTwo.add(silver, { isAlways: true, minStack: 5, maxStack: 50 });
  chestTwo.add(equipmentTable, { weight: 8, isUnique: true });

  expect(chestTwo).to.be.not.null;
  expect(chestTwo).to.have.property('name');
  expect(chestTwo._itemEntries).to.be.an('array');

  megaChest.add(chestOne, { forceDrop: true, minStack: 1, maxStack: 5 });
  megaChest.add(chestTwo, { forceDrop: true, minStack: 1, maxStack: 5 });
  expect(megaChest).to.be.not.null;
  expect(megaChest).to.have.property('name');
  expect(megaChest._itemEntries).to.be.an('array');
}

async function DropLoots() {
  let drops = await chestOne.dropLoot();
  console.log('--chest one loots:--');
  drops.forEach(drop => expect(drop.item.name).to.exist);
  drops.forEach(drop => {
    console.log(drop.item.name + ' ' + drop.stack);
  });
  drops = await chestTwo.dropLoot();
  console.log('--chest two loots:--');
  drops.forEach(drop => expect(drop.item.name).to.exist);
  drops.forEach(drop => {
    console.log(drop.item.name + ' ' + drop.stack);
  });
  drops = await megaChest.dropLoot();
  console.log('--mega chest loots:--');
  drops.forEach(drop => expect(drop.item.name).to.exist);
  drops.forEach(drop => {
    console.log(drop.item.name + ' ' + drop.stack);
  });
}
