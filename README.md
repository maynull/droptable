# DropTable

A loot drop table implementation in NodeJS.

Drop Table is used to create & loot from LootTables which includes items, other loot tables using their weights. Weights are arbitrary, not percentages, and don't need to add up to 100.
There's a good overview of loot tables on
[Lost Garden](http://www.lostgarden.com/2014/12/loot-drop-tables.html).

```javascript
//Create Items
let gold = createItem('gold');
let silver = createItem('silver');
let sword = createItem('sword');
let helmet = createItem('helmet');
//Create Loot Table
let equipmentTable = createLootTable('equipments', dropCount);
//Add Loot Table Entry
equipmentTable.add(sword, 10, false, false, true, 0, 1);
equipmentTable.add(helmet, 10, false, false, true, 0, 1);
//Create Another Loot Table
let chestOne = createLootTable('gold chest', dropCount);
//Add Loot Table Entry
chestOne.add(gold, 10, false, true, false, 10, 50);
chestOne.add(equipmentTable, 8, false, false, true, 0, 1);
//Create Another Loot Table
let chestTwo = createLootTable('silver chest', dropCount);
//Add Loot Table Entry
chestTwo.add(silver, 10, false, true, false, 0, 50);
chestTwo.add(equipmentTable, 8, false, false, true, 0, 1);
//Drop Loot from Chest One
let drops = await chestOne.dropLoot();
console.log('chest one loots:');
drops.forEach(drop => {
	console.log(drop.item.name + ' ' + drop.stack);
});
//Drop Loot from Chest Two
drops = await chestTwo.dropLoot();
console.log('chest two loots:');
drops.forEach(drop => {
	console.log(drop.item.name + ' ' + drop.stack);
});
```

Check out tests/dropTest.js to get more idea on feature set.
