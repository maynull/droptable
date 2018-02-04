const randomNumber = require('random-number-csprng');
const Promise = require('bluebird');

async function randomPick(items) {
  const totalWeight = items.reduce(function(previous, item) {
    return { weight: previous.weight + item.weight };
  }).weight;
  const targetWeight = await randomNumber(0, totalWeight);
  let currentWeight = 0;
  return items.find(item => {
    currentWeight += item.weight;
    if (currentWeight > targetWeight) {
      return item;
    }
  });
}

function createLootTable(name, dropCount) {
  return {
    name: name,
    _itemEntries: [],
    _dropCount: dropCount,
    add: function addEntry(item, weight, forceDrop, isAlways, isUnique, minStack, maxStack) {
      this._itemEntries.push({
        item: item,
        weight: weight,
        forceDrop: forceDrop,
        isAlways: isAlways,
        isUnique: isUnique,
        minStack: minStack,
        maxStack: maxStack
      });
    },
    select: async function selectDrop(itemEntry) {
      if (!itemEntry.forceDrop && (itemEntry.drop != null && typeof itemEntry.drop === 'function')) {
        return await itemEntry.drop();
      } else {
          let stack = await randomNumber(itemEntry.minStack, itemEntry.maxStack);
          return {item:itemEntry.item, stack};
      }
    },
    drop: async function dropItem(subItemEntryArr) {
      const filteredItemsEntries = subItemEntryArr === undefined ? this._itemEntries : subItemEntryArr;
      let itemEntry = await randomPick(filteredItemsEntries);
      return await this.select(itemEntry);
    },
    dropLoot: async function dropLoot() {
      let curDropCount = this._dropCount;
      let filteredItemEntries = this._itemEntries.slice();
      let drops = await Promise.all(filteredItemEntries.filter(itemEntry => {
        if (itemEntry.isAlways) {
          return itemEntry;
        }
      }).map(itemEntry => {return this.select(itemEntry)})
      );
      if (drops.length >= curDropCount) {
        return drops;
      } else {
        curDropCount -= drops.length;
        for (let i = 0; i < curDropCount; i++) {
          const nextDrop = await this.drop(filteredItemEntries);
          drops.push(nextDrop);
          if (nextDrop.item.isUnique) {
            filteredItemEntries = filteredItemEntries.filter(item => item !== nextDrop.item);
          }
        }
        return drops;
      }
    }
  };
}

function createItem(name) {
  return {
    name: name
  };
}
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
