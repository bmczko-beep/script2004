import {
  defineBot,
  Execution,
  Game,
  Inventory,
  LoopingBot,
  Shop,
} from '@rs2b0t/api';

class GeneralStoreSeller extends LoopingBot {
  private readonly itemToSell = 'Bronze dagger';

  override async onStart(): Promise<void> {
    await Execution.delayUntil(() => Game.ingame(), 0);
    this.log(`General Store Seller started — selling ${this.itemToSell}`);
  }

  async loop(): Promise<void> {
    if (!Shop.isOpen()) {
      const opened = await Shop.open('Shop keeper');

      if (!opened) {
        this.log('Could not open General Store');
        await Execution.delayTicks(2);
        return;
      }

      await Execution.delayUntil(() => Shop.isOpen(), 3000);
      return;
    }

    const count = Inventory.count(this.itemToSell);

    if (count <= 0) {
      this.log('Nothing left to sell — stopping.');
      this.stop();
      return;
    }

    const before = Inventory.count(this.itemToSell);
    const sold = await Shop.sell(this.itemToSell, before);

    if (sold <= 0) {
      this.log(`Failed to sell ${this.itemToSell}`);
      await Execution.delayTicks(2);
      return;
    }

    const completed = await Execution.delayUntil(
      () => Inventory.count(this.itemToSell) < before,
      3000
    );

    if (completed) {
      this.log(`Sold ${sold} ${this.itemToSell}`);
    } else {
      this.log('Sell action was not confirmed');
    }

    await Execution.delayTicks(1);
  }
}

export default defineBot({
  name: 'General Store Seller',
  version: '1.0',
  description: 'Sells a selected item to the General Store.',
  create: () => new GeneralStoreSeller(),
});
