import React, { useState } from 'react';
import { Match } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { MapPin, Calendar, Clock, FileText, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const [showModal, setShowModal] = useState(false);

  const isFinished = match.status === 'FINISHED';
  const homeWon = isFinished && (match.scoreHome ?? 0) > (match.scoreAway ?? 0);
  const awayWon = isFinished && (match.scoreAway ?? 0) > (match.scoreHome ?? 0);

  return (
    <>
      <Card
        onClick={() => setShowModal(true)}
        className="cursor-pointer border-0 bg-[#252833] hover:bg-[#2a2e3a] active:bg-[#2d323f] transition-all rounded-2xl overflow-hidden w-full max-w-full shadow-sm select-none"
      >
        {/* Top Header: ID, Round, Date/Time */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#1f222b] border-b border-[#2d313e] text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge className="font-mono text-[10px] px-1.5 py-0 h-4 bg-[#2b2f3d] text-[#f4f5f8] border-0 shrink-0">
              {match.id}
            </Badge>
            <span className="text-[#8e93a4] font-medium text-[11px] truncate max-w-[120px] sm:max-w-[160px]">
              {match.round || match.poule}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#8e93a4] text-[11px] shrink-0">
            <Calendar className="w-3 h-3 text-[#8e93a4] shrink-0" />
            <span>{match.date}</span>
            <Clock className="w-3 h-3 text-[#8e93a4] ml-1 shrink-0" />
            <span>{match.time}</span>
          </div>
        </div>

        <CardContent className="p-3">
          {/* Teams and Main Score */}
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Home Team */}
            <div className="flex-1 min-w-0 max-w-[44%]">
              <span
                className={`text-xs sm:text-sm font-bold truncate block ${
                  homeWon ? 'text-[#f4f5f8]' : 'text-[#c4c8d4]'
                }`}
                title={match.homeTeam}
              >
                {match.homeTeam}
              </span>
              <span className="text-[9px] text-[#8e93a4] uppercase tracking-wider font-semibold">
                Domicile
              </span>
            </div>

            {/* Sets Score or VS Badge */}
            <div className="shrink-0 flex flex-col items-center justify-center px-1">
              {isFinished ? (
                <div className="flex items-center gap-1.5 bg-[#1c1e26] border border-[#2d313e] px-2.5 py-0.5 rounded-xl">
                  <span
                    className={`text-sm font-extrabold font-mono ${
                      homeWon ? 'text-[#f4f5f8]' : 'text-[#8e93a4]'
                    }`}
                  >
                    {match.scoreHome ?? 0}
                  </span>
                  <span className="text-[#8e93a4] text-xs">-</span>
                  <span
                    className={`text-sm font-extrabold font-mono ${
                      awayWon ? 'text-[#f4f5f8]' : 'text-[#8e93a4]'
                    }`}
                  >
                    {match.scoreAway ?? 0}
                  </span>
                </div>
              ) : (
                <Badge className="text-[10px] font-bold bg-[#1c1e26] text-[#8e93a4] border-0 px-2 py-0.5">
                  À VENIR
                </Badge>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 min-w-0 max-w-[44%] text-right">
              <span
                className={`text-xs sm:text-sm font-bold truncate block ${
                  awayWon ? 'text-[#f4f5f8]' : 'text-[#c4c8d4]'
                }`}
                title={match.awayTeam}
              >
                {match.awayTeam}
              </span>
              <span className="text-[9px] text-[#8e93a4] uppercase tracking-wider font-semibold">
                Extérieur
              </span>
            </div>
          </div>

          {/* Detailed Set Scores if Finished */}
          {isFinished && match.setScores && match.setScores.length > 0 && (
            <>
              <Separator className="my-3 opacity-40" />
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {match.setScores.map((set, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[11px] bg-card border border-border px-2 py-0.5 rounded-md text-muted-foreground font-semibold"
                  >
                    {set}
                  </span>
                ))}
                {match.totalPoints && (
                  <span className="text-[10px] text-muted-foreground/60 font-mono ml-1">
                    ({match.totalPoints} pts)
                  </span>
                )}
              </div>
            </>
          )}

          {/* Gymnasium info for Upcoming */}
          {!isFinished && match.venue && (
            <>
              <Separator className="my-3 opacity-40" />
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="truncate">{match.venue}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 1. Match Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-sm p-4 bg-[#20232c] border-0 rounded-3xl text-[#f4f5f8] shadow-2xl">
          <DialogHeader className="text-left space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <Badge className="font-mono text-[10px] px-1.5 py-0.5 bg-[#2b2f3d] text-[#f4f5f8] border-0">
                {match.id}
              </Badge>
              <span className="text-xs text-[#8e93a4] font-medium">{match.round || match.poule}</span>
            </div>
            <DialogTitle className="text-sm font-black text-[#f4f5f8] leading-tight pt-1">
              {match.homeTeam} vs {match.awayTeam}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#8e93a4]">
              {match.date} à {match.time} {match.venue ? `• ${match.venue}` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {/* Score / Status Banner */}
            {isFinished ? (
              <div className="bg-[#181a20] p-3 rounded-2xl flex items-center justify-between">
                <div className="text-left min-w-0 max-w-[40%]">
                  <span className={`text-xs font-bold truncate block ${homeWon ? 'text-[#f4f5f8]' : 'text-[#8e93a4]'}`}>
                    {match.homeTeam}
                  </span>
                  <p className="text-[10px] text-[#8e93a4]">Domicile</p>
                </div>
                <div className="px-3 py-1 bg-[#232630] rounded-xl font-mono font-black text-sm text-[#f4f5f8] shrink-0">
                  {match.scoreHome ?? 0} - {match.scoreAway ?? 0}
                </div>
                <div className="text-right min-w-0 max-w-[40%]">
                  <span className={`text-xs font-bold truncate block ${awayWon ? 'text-[#f4f5f8]' : 'text-[#8e93a4]'}`}>
                    {match.awayTeam}
                  </span>
                  <p className="text-[10px] text-[#8e93a4]">Extérieur</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#181a20] p-2.5 rounded-2xl text-center">
                <span className="text-xs font-bold text-[#8e93a4]">Rencontre à venir</span>
              </div>
            )}

            {/* Official PDF Sheets (Feuille de match & Convocation) */}
            <div className="space-y-2 pt-1">
              {isFinished ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const url = api.getMatchSheetUrl(match.id, 'match');
                      try {
                        const webkit = (window as any).webkit;
                        if (webkit && webkit.messageHandlers && webkit.messageHandlers.sideoutNative) {
                          webkit.messageHandlers.sideoutNative.postMessage({ action: 'openUrl', url });
                          return;
                        }
                      } catch {}
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#363a48] hover:bg-[#434859] active:bg-[#4d5366] text-[#f4f5f8] text-xs font-bold transition-all border-0 outline-none cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#f4f5f8]" />
                    <span>Feuille de match (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#8e93a4] ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const url = api.getMatchSheetUrl(match.id, 'convocation');
                      try {
                        const webkit = (window as any).webkit;
                        if (webkit && webkit.messageHandlers && webkit.messageHandlers.sideoutNative) {
                          webkit.messageHandlers.sideoutNative.postMessage({ action: 'openUrl', url });
                          return;
                        }
                      } catch {}
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#232630] hover:bg-[#282d3a] text-[#8e93a4] hover:text-[#f4f5f8] text-xs font-medium transition-all border-0 outline-none cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Feuille de convocation (PDF)</span>
                    <ExternalLink className="w-3 h-3 text-[#8e93a4] ml-0.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const url = api.getMatchSheetUrl(match.id, 'convocation');
                      try {
                        const webkit = (window as any).webkit;
                        if (webkit && webkit.messageHandlers && webkit.messageHandlers.sideoutNative) {
                          webkit.messageHandlers.sideoutNative.postMessage({ action: 'openUrl', url });
                          return;
                        }
                      } catch {}
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#363a48] hover:bg-[#434859] active:bg-[#4d5366] text-[#f4f5f8] text-xs font-bold transition-all border-0 outline-none cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#f4f5f8]" />
                    <span>Feuille de convocation (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#8e93a4] ml-0.5" />
                  </button>
                  <p className="text-[10px] text-center text-[#8e93a4] pt-0.5">
                    La feuille de match (FDME) sera archivée dès la validation de la rencontre.
                  </p>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
