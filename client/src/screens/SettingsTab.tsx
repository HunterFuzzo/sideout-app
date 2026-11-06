import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { NotificationSettings } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Bell, ShieldCheck, Trash2, CheckCircle2, ChevronDown, X } from 'lucide-react';

const PACA_CLUBS = [
  'VOLLEY-BALL STADE LAURENTIN',
  'AS CANNES VOLLEY-BALL',
  'NICE VOLLEY-BALL',
  'OAJLP VOLLEY-BALL ANTIBES',
  'AS MONACO VOLLEY-BALL',
  'PAYS D\'AIX VENELLES VB',
  'TOULON SIX-FOURS VB',
  'MANDELIEU LA NAPOULE VB',
  'MARSEILLE VOLLEY 13',
  'GRASSE VOLLEY-BALL',
  'VILLENEUVE LOUBET VB',
  'US DE CAGNES VB',
  'SALON VOLLEY-BALL',
  'AUBAGNE CARNOUX VB',
  'ISTRES PROVENCE VOLLEY',
];

export const SettingsTab: React.FC = () => {
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(storage.getNotificationSettings());
  const [favoriteClub, setFavoriteClub] = useState<string>(storage.getFavoriteClub());
  const [followedClubs, setFollowedClubs] = useState<string[]>(() => storage.getFollowedClubs());
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  useEffect(() => {
    setNotifSettings(storage.getNotificationSettings());
    setFavoriteClub(storage.getFavoriteClub());
    setFollowedClubs(storage.getFollowedClubs());
  }, []);

  const handleUpdateNotif = (key: keyof NotificationSettings, value: any) => {
    const updated = storage.saveNotificationSettings({ [key]: value });
    setNotifSettings(updated);
  };

  const handleClubChange = (club: string) => {
    const selected = club === 'NONE' ? '' : club;
    storage.setFavoriteClub(selected);
    storage.saveNotificationSettings({ favoriteClub: selected });
    setFavoriteClub(selected);
  };

  const handleClearFollowed = () => {
    storage.clearAllFollowed();
    setFollowedClubs([]);
  };

  const handleRemoveClub = (clubName: string) => {
    storage.removeFollowedClub(clubName);
    setFollowedClubs(storage.getFollowedClubs());
  };

  const triggerTestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('🏐 SideOut - Rappel de match', {
          body: 'Rappel J-1 : Stade Laurentin vs Nice VB demain à 20h00 !',
          icon: '/favicon.ico',
        });
        setTestNotificationSent(true);
        setTimeout(() => setTestNotificationSent(false), 4000);
      }
    } else {
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Title only */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#f4f5f8]">
          Paramètres
        </h2>
      </div>

      {/* 1. Mon Club Favori */}
      <Card className="border-0 bg-[#232630] rounded-2xl">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-bold text-[#f4f5f8]">Mon Club</CardTitle>
          <CardDescription className="text-xs text-[#8e93a4]">
            Sélectionnez votre club pour suivre prioritairement ses scores
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <div className="relative">
            <select
              value={favoriteClub || 'NONE'}
              onChange={(e) => handleClubChange(e.target.value)}
              className="w-full appearance-none bg-[#1b1d24] border-0 rounded-xl h-11 pl-3.5 pr-11 text-xs text-[#f4f5f8] outline-none focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="NONE">Aucun club particulier</option>
              {PACA_CLUBS.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e93a4]" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Notifications & Rappels */}
      <Card className="border-0 bg-[#232630] rounded-2xl">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#f4f5f8]" />
            <CardTitle className="text-sm font-bold text-[#f4f5f8]">Notifications</CardTitle>
          </div>
          <CardDescription className="text-xs text-[#8e93a4]">
            Alertes des résultats et rappels programmés
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-4">
          {/* Checkbox 1: Résultats des matchs suivis */}
          <div className="flex items-start justify-between gap-3 py-1">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#f4f5f8]">Résultats des matchs suivis</p>
              <p className="text-[11px] text-[#8e93a4]">
                Notification instantanée dès que le score final est homologué
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.resultsEnabled}
              onChange={(e) => handleUpdateNotif('resultsEnabled', e.target.checked)}
              className="w-5 h-5 rounded-md bg-[#1b1d24] border-0 accent-[#3d4457] cursor-pointer mt-0.5"
            />
          </div>

          <Separator className="bg-[#2c303d]" />

          {/* Checkbox 2: Rappels 1 semaine, 3 jours, 1 jour avant */}
          <div className="flex items-start justify-between gap-3 py-1">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#f4f5f8]">Rappels avant-match (J-7, J-3, J-1)</p>
              <p className="text-[11px] text-[#8e93a4]">
                Envoi d'un rappel automatique 1 semaine, puis 3 jours, puis 1 jour avant la rencontre
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.matchRemindersEnabled}
              onChange={(e) => handleUpdateNotif('matchRemindersEnabled', e.target.checked)}
              className="w-5 h-5 rounded-md bg-[#1b1d24] border-0 accent-[#3d4457] cursor-pointer mt-0.5"
            />
          </div>

          {/* Test button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerTestNotification}
              className="w-full h-9 text-xs rounded-xl bg-[#2b2f3d] hover:bg-[#343949] text-[#f4f5f8] border-0 outline-none focus:outline-none"
            >
              {testNotificationSent ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Notification de test envoyée !
                </span>
              ) : (
                'Tester les notifications'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Équipes suivies */}
      <Card className="border-0 bg-[#232630] rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#f4f5f8]">Équipes suivies</p>
              <p className="text-[11px] text-[#8e93a4]">
                {followedClubs.length === 0
                  ? '0 équipe en mémoire'
                  : `${followedClubs.length} équipe${followedClubs.length > 1 ? 's' : ''} en mémoire`}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleClearFollowed}
              disabled={followedClubs.length === 0}
              className="h-8 text-xs px-3 bg-[#2b2f3d] hover:bg-[#363b4d] text-[#f4f5f8] border-0 rounded-xl outline-none cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Vider
            </Button>
          </div>

          {followedClubs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {followedClubs.map((club) => (
                <span
                  key={club}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] bg-[#1a1c23] text-[#f4f5f8] font-medium border border-[#2b2f3d]"
                >
                  <span className="truncate max-w-[200px]">{club}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClub(club)}
                    className="hover:text-rose-400 text-[#8e93a4] transition-colors cursor-pointer"
                    title={`Ne plus suivre ${club}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Mentions de sécurité */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-[#8e93a4] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#a1a7b8]" />
          SideOut PACA • Données certifiées FFVB Indoor
        </p>
      </div>
    </div>
  );
};
