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
    if (currentWeight >= targetWeight) {
      return item;
    }
  });
}

function createLootTable(name, dropCount) {
  return {
    name: name,
    _itemEntries: [],
    _dropCount: dropCount,
    add: function addEntry(item, opts) {
      const defaults = {
        weight: 10,
        forceDrop: false,
        isAlways: false,
        isUnique: false,
        minStack: 1,
        maxStack: 1
      };
      const entry = Object.assign({}, defaults, opts, { item });
      this._itemEntries.push(entry);
    },
    select: async function selectDrop(itemEntry) {
      if (!itemEntry.forceDrop && (itemEntry.item.drop != null && typeof itemEntry.item.drop === 'function')) {
        return await itemEntry.item.drop();
      } else {
        let stack = itemEntry.minStack;
        if (itemEntry.maxStack > itemEntry.minStack)
          stack = await randomNumber(itemEntry.minStack, itemEntry.maxStack);
        return { item: itemEntry.item, stack };
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
      let drops = await Promise.all(
        filteredItemEntries
          .filter(itemEntry => {
            if (itemEntry.isAlways) {
              return itemEntry;
            }
          })
          .map(itemEntry => {
            return this.select(itemEntry);
          })
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

module.exports.createItem = createItem;
module.exports.createLootTable = createLootTable;
