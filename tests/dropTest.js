const randomNumber = require('random-number-csprng');
const { createLootTable, createItem } = require('../droptable');

async function Test() {
  let dropCount = await randomNumber(1, 2);
  const chestOne = createLootTable('gold chest', dropCount);
  dropCount = await randomNumber(1, 2);
  const chestTwo = createLootTable('silver chest', dropCount);
  dropCount = await randomNumber(1, 2);
  const megaChest = createLootTable('mega chest', dropCount);
  dropCount = await randomNumber(1, 2);
  const equipmentTable = createLootTable('equipments', dropCount);

  let gold = createItem('gold');
  let silver = createItem('silver');
  let sword = createItem('sword');
  let helmet = createItem('helmet');

  equipmentTable.add(sword, 10, false, false, true, 0, 1);
  equipmentTable.add(helmet, 10, false, false, true, 0, 1);

  chestOne.add(gold, 10, false, true, false, 10, 50);
  chestOne.add(equipmentTable, 8, false, false, true, 0, 1);

  chestTwo.add(silver, 10, false, true, false, 0, 50);
  chestTwo.add(equipmentTable, 8, false, false, true, 0, 1);

  megaChest.add(chestOne, 10, true, false, false, 1, 5);
  megaChest.add(chestTwo, 10, true, false, false, 1, 5);

  let drops = await chestOne.dropLoot();
  console.log('chest one');
  drops.forEach(drop => {
    console.log(drop.item.name + ' ' + drop.stack);
  });
  drops = await chestTwo.dropLoot();
  console.log('chest two');
  drops.forEach(drop => {
    console.log(drop.item.name + ' ' + drop.stack);
  });
  drops = await megaChest.dropLoot();
  console.log('mega chest');
  drops.forEach(drop => {
    console.log(drop.item.name + ' ' + drop.stack);
  });
}

Test().then(() => {
  console.log('finished');
});