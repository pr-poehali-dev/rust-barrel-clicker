import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Weapon {
  id: string;
  name: string;
  damage: number;
  durability: number;
  maxDurability: number;
  price: number;
  icon: string;
}

interface Barrel {
  type: 'green' | 'blue' | 'red' | 'gold';
  name: string;
  maxHp: number;
  hp: number;
  scrapReward: number;
  fuelReward: number;
  skinChance: number;
  color: string;
  unlockLevel: number;
}

interface Skin {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  from: string;
}

interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  scrap: number;
  fuel: number;
  barrelsDestroyed: number;
}

const Index = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    xp: 0,
    xpToNext: 100,
    scrap: 100,
    fuel: 10,
    barrelsDestroyed: 0,
  });

  const [barrels, setBarrels] = useState<Barrel[]>([
    { type: 'green', name: 'Зелёная бочка', maxHp: 1000, hp: 1000, scrapReward: 10, fuelReward: 0, skinChance: 5, color: '#10B981', unlockLevel: 1 },
    { type: 'blue', name: 'Синяя бочка', maxHp: 5000, hp: 5000, scrapReward: 50, fuelReward: 0, skinChance: 10, color: '#0EA5E9', unlockLevel: 5 },
    { type: 'red', name: 'Красная бочка', maxHp: 10000, hp: 10000, scrapReward: 0, fuelReward: 5, skinChance: 15, color: '#F97316', unlockLevel: 10 },
    { type: 'gold', name: 'Золотая бочка', maxHp: 50000, hp: 50000, scrapReward: 500, fuelReward: 20, skinChance: 30, color: '#FBBF24', unlockLevel: 20 },
  ]);

  const [currentBarrelIndex, setCurrentBarrelIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const [weapons, setWeapons] = useState<Weapon[]>([
    { id: 'fist', name: 'Кулак', damage: 1, durability: Infinity, maxDurability: Infinity, price: 0, icon: '👊' },
    { id: 'axe', name: 'Топор', damage: 10, durability: 100, maxDurability: 100, price: 50, icon: '🪓' },
    { id: 'pickaxe', name: 'Кирка', damage: 25, durability: 150, maxDurability: 150, price: 200, icon: '⛏️' },
    { id: 'drill', name: 'Бур', damage: 100, durability: 200, maxDurability: 200, price: 800, icon: '⚙️' },
  ]);

  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(weapons[0]);
  const [inventory, setInventory] = useState<Skin[]>([]);

  const currentBarrel = barrels[currentBarrelIndex];

  const handleBarrelClick = () => {
    if (currentWeapon.durability <= 0) {
      toast.error('Оружие сломано! Купите новое или вернитесь к кулаку');
      return;
    }

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const damage = currentWeapon.damage;
    const newHp = Math.max(0, currentBarrel.hp - damage);

    const updatedBarrels = [...barrels];
    updatedBarrels[currentBarrelIndex].hp = newHp;
    setBarrels(updatedBarrels);

    if (currentWeapon.id !== 'fist') {
      const updatedWeapons = weapons.map(w =>
        w.id === currentWeapon.id ? { ...w, durability: w.durability - 1 } : w
      );
      setWeapons(updatedWeapons);
      setCurrentWeapon({ ...currentWeapon, durability: currentWeapon.durability - 1 });
    }

    if (newHp === 0) {
      handleBarrelDestroyed();
    }
  };

  const handleBarrelDestroyed = () => {
    const scrapEarned = currentBarrel.scrapReward;
    const fuelEarned = currentBarrel.fuelReward;
    const xpEarned = Math.floor(currentBarrel.maxHp / 100);

    setPlayerStats(prev => ({
      ...prev,
      scrap: prev.scrap + scrapEarned,
      fuel: prev.fuel + fuelEarned,
      xp: prev.xp + xpEarned,
      barrelsDestroyed: prev.barrelsDestroyed + 1,
    }));

    const skinRoll = Math.random() * 100;
    if (skinRoll < currentBarrel.skinChance) {
      const newSkin: Skin = {
        id: `skin-${Date.now()}`,
        name: `${currentBarrel.name} скин #${inventory.length + 1}`,
        rarity: currentBarrel.type === 'gold' ? 'legendary' : currentBarrel.type === 'red' ? 'epic' : currentBarrel.type === 'blue' ? 'rare' : 'common',
        from: currentBarrel.name,
      };
      setInventory(prev => [...prev, newSkin]);
      toast.success(`🎉 Выпал скин: ${newSkin.name}!`, { duration: 3000 });
    }

    toast.success(`+${scrapEarned} скрап, +${fuelEarned} топливо, +${xpEarned} XP`);

    const updatedBarrels = [...barrels];
    updatedBarrels[currentBarrelIndex].hp = updatedBarrels[currentBarrelIndex].maxHp;
    setBarrels(updatedBarrels);
  };

  useEffect(() => {
    if (playerStats.xp >= playerStats.xpToNext) {
      const newLevel = playerStats.level + 1;
      setPlayerStats(prev => ({
        ...prev,
        level: newLevel,
        xp: 0,
        xpToNext: Math.floor(prev.xpToNext * 1.5),
      }));
      toast.success(`🎊 Уровень ${newLevel}!`, { duration: 3000 });
    }
  }, [playerStats.xp, playerStats.xpToNext, playerStats.level]);

  const buyWeapon = (weapon: Weapon) => {
    if (playerStats.scrap >= weapon.price) {
      setPlayerStats(prev => ({ ...prev, scrap: prev.scrap - weapon.price }));
      const restoredWeapon = { ...weapon, durability: weapon.maxDurability };
      setWeapons(prev => prev.map(w => (w.id === weapon.id ? restoredWeapon : w)));
      setCurrentWeapon(restoredWeapon);
      toast.success(`Куплено: ${weapon.name}`);
    } else {
      toast.error('Недостаточно скрапа!');
    }
  };

  const selectBarrel = (index: number) => {
    const barrel = barrels[index];
    if (playerStats.level < barrel.unlockLevel) {
      toast.error(`Доступно с уровня ${barrel.unlockLevel}`);
    } else {
      setCurrentBarrelIndex(index);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 mb-2">
            Rust Barrel Clicker
          </h1>
          <p className="text-gray-600">Ломай бочки, собирай скины, качайся!</p>
        </div>

        <Card className="p-6 mb-6 bg-white/80 backdrop-blur shadow-xl border-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="User" className="text-purple-500" size={24} />
                <span className="text-2xl font-bold">Уровень {playerStats.level}</span>
              </div>
              <Progress value={(playerStats.xp / playerStats.xpToNext) * 100} className="h-3" />
              <span className="text-sm text-gray-600">{playerStats.xp}/{playerStats.xpToNext} XP</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Coins" className="text-orange-500" size={24} />
                <span className="text-2xl font-bold">{playerStats.scrap}</span>
              </div>
              <span className="text-sm text-gray-600">Скрап</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Flame" className="text-red-500" size={24} />
                <span className="text-2xl font-bold">{playerStats.fuel}</span>
              </div>
              <span className="text-sm text-gray-600">Топливо</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="TrendingUp" className="text-green-500" size={24} />
                <span className="text-2xl font-bold">{playerStats.barrelsDestroyed}</span>
              </div>
              <span className="text-sm text-gray-600">Бочек сломано</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur shadow-xl border-2">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge style={{ backgroundColor: currentBarrel.color }} className="text-white px-4 py-2 text-lg">
                      {currentBarrel.name}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Уровень {currentBarrel.unlockLevel}+
                    </span>
                  </div>
                  <div className="text-2xl font-bold">
                    {currentBarrel.hp} / {currentBarrel.maxHp} HP
                  </div>
                </div>
                <Progress
                  value={(currentBarrel.hp / currentBarrel.maxHp) * 100}
                  className="h-6"
                  style={{ backgroundColor: `${currentBarrel.color}20` }}
                />
              </div>

              <div className="flex justify-center mb-6">
                <button
                  onClick={handleBarrelClick}
                  className={`relative transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isShaking ? 'animate-shake' : ''
                  }`}
                  style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
                >
                  <div
                    className="w-64 h-80 rounded-2xl flex items-center justify-center animate-pulse-glow cursor-pointer overflow-hidden relative"
                    style={{
                      boxShadow: `0 0 60px ${currentBarrel.color}80, inset 0 0 20px ${currentBarrel.color}40`,
                      border: `4px solid ${currentBarrel.color}`,
                    }}
                  >
                    <img 
                      src="https://cdn.poehali.dev/files/4923ee54-3d03-4047-9248-972ac5bb9c83.jpg" 
                      alt="Rust Barrel"
                      className="w-full h-full object-cover"
                      style={{
                        filter: `hue-rotate(${
                          currentBarrel.type === 'green' ? '0deg' : 
                          currentBarrel.type === 'blue' ? '0deg' : 
                          currentBarrel.type === 'red' ? '180deg' : 
                          '45deg'
                        }) brightness(${
                          currentBarrel.type === 'gold' ? '1.3' : '1'
                        })`,
                      }}
                    />
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${currentBarrel.color}30, transparent)`,
                      }}
                    />
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {barrels.map((barrel, index) => (
                  <Button
                    key={barrel.type}
                    onClick={() => selectBarrel(index)}
                    variant={currentBarrelIndex === index ? 'default' : 'outline'}
                    disabled={playerStats.level < barrel.unlockLevel}
                    className="h-20 relative"
                    style={{
                      backgroundColor: currentBarrelIndex === index ? barrel.color : 'transparent',
                      borderColor: barrel.color,
                      color: currentBarrelIndex === index ? 'white' : barrel.color,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-1">🛢️</span>
                      <span className="text-xs font-semibold">{barrel.name.split(' ')[0]}</span>
                      {playerStats.level < barrel.unlockLevel && (
                        <Icon name="Lock" size={16} className="absolute top-2 right-2" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              <Card className="p-4 bg-gradient-to-r from-orange-100 to-purple-100 border-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{currentWeapon.icon}</span>
                    <div>
                      <div className="font-bold text-lg">{currentWeapon.name}</div>
                      <div className="text-sm text-gray-600">Урон: {currentWeapon.damage}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {currentWeapon.durability !== Infinity && (
                      <>
                        <div className="text-sm text-gray-600 mb-1">
                          Прочность: {currentWeapon.durability}/{currentWeapon.maxDurability}
                        </div>
                        <Progress
                          value={(currentWeapon.durability / currentWeapon.maxDurability) * 100}
                          className="h-2 w-32"
                        />
                      </>
                    )}
                    {currentWeapon.durability === Infinity && (
                      <div className="text-sm text-gray-600">♾️ Вечное</div>
                    )}
                  </div>
                </div>
              </Card>
            </Card>
          </div>

          <div>
            <Tabs defaultValue="shop" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="shop">
                  <Icon name="ShoppingCart" size={16} className="mr-1" />
                  Магазин
                </TabsTrigger>
                <TabsTrigger value="skins">
                  <Icon name="Package" size={16} className="mr-1" />
                  Скины
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <Icon name="User" size={16} className="mr-1" />
                  Профиль
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shop">
                <Card className="p-4 bg-white/90 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="Axe" className="text-orange-500" />
                    Оружие
                  </h3>
                  <div className="space-y-3">
                    {weapons.slice(1).map((weapon) => (
                      <Card
                        key={weapon.id}
                        className="p-4 hover:shadow-lg transition-all cursor-pointer border-2"
                        onClick={() => buyWeapon(weapon)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{weapon.icon}</span>
                            <div>
                              <div className="font-bold">{weapon.name}</div>
                              <div className="text-sm text-gray-600">Урон: {weapon.damage}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Прочность: {weapon.maxDurability}
                          </span>
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                            <Icon name="Coins" size={14} className="mr-1" />
                            {weapon.price}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="skins">
                <Card className="p-4 bg-white/90 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="Sparkles" className="text-purple-500" />
                    Инвентарь ({inventory.length})
                  </h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {inventory.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Пока нет скинов. Ломай бочки!
                      </p>
                    ) : (
                      inventory.map((skin) => (
                        <Card
                          key={skin.id}
                          className={`p-3 ${getRarityColor(skin.rarity)} text-white`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon name="Award" size={20} />
                            <span className="font-bold">{skin.name}</span>
                          </div>
                          <div className="text-xs opacity-90">
                            {skin.rarity.toUpperCase()} • {skin.from}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card className="p-4 bg-white/90 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="User" className="text-blue-500" />
                    Статистика
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                      <span className="font-semibold flex items-center gap-2">
                        <Icon name="TrendingUp" size={18} />
                        Уровень
                      </span>
                      <span className="text-2xl font-bold text-purple-600">{playerStats.level}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg">
                      <span className="font-semibold flex items-center gap-2">
                        <Icon name="Target" size={18} />
                        Бочек сломано
                      </span>
                      <span className="text-2xl font-bold text-orange-600">{playerStats.barrelsDestroyed}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                      <span className="font-semibold flex items-center gap-2">
                        <Icon name="Package" size={18} />
                        Скинов собрано
                      </span>
                      <span className="text-2xl font-bold text-green-600">{inventory.length}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                      <span className="font-semibold flex items-center gap-2">
                        <Icon name="Coins" size={18} />
                        Скрап
                      </span>
                      <span className="text-2xl font-bold text-blue-600">{playerStats.scrap}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg">
                      <span className="font-semibold flex items-center gap-2">
                        <Icon name="Flame" size={18} />
                        Топливо
                      </span>
                      <span className="text-2xl font-bold text-red-600">{playerStats.fuel}</span>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                      <div className="text-center">
                        <Icon name="Trophy" size={32} className="mx-auto mb-2" />
                        <div className="text-sm opacity-90 mb-1">Следующий уровень</div>
                        <Progress 
                          value={(playerStats.xp / playerStats.xpToNext) * 100} 
                          className="h-3 mb-2 bg-white/30" 
                        />
                        <div className="font-bold">{playerStats.xp} / {playerStats.xpToNext} XP</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;