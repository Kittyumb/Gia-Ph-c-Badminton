import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeDefaultTeams,
  generateSchedule,
  calculateStandings,
  determineWinner,
  createKnockoutGame,
  syncKnockoutBracket,
  getAwards,
  createFreshTournament,
} from './tournament';
import { Bracket, Match } from '../types/tournament';

test('Default teams generation initializes 8 teams with 2 players each', () => {
  const teams = makeDefaultTeams();
  assert.equal(teams.length, 8);
  assert.equal(teams[0].id, 't1');
  assert.equal(teams[0].name, 'Đội 01');
  assert.ok(teams[0].p1 && teams[0].p2);
});

test('Schedule generator generates 16 matches across 2 courts with 4 matches per team', () => {
  const teams = makeDefaultTeams();
  const schedule = generateSchedule(teams);
  assert.equal(schedule.length, 16);

  const court1 = schedule.filter((m) => m.court === 1);
  const court2 = schedule.filter((m) => m.court === 2);
  assert.equal(court1.length, 8);
  assert.equal(court2.length, 8);

  const teamCounts: Record<string, number> = {};
  teams.forEach((t) => (teamCounts[t.id] = 0));
  schedule.forEach((m) => {
    teamCounts[m.a]++;
    teamCounts[m.b]++;
  });

  teams.forEach((t) => {
    assert.equal(teamCounts[t.id], 4, `Team ${t.id} must play exactly 4 matches`);
  });
});

test('Match winner determination and scoring rules (+2 win, +1 loss, forfeit handling)', () => {
  const normalMatch: Match = {
    id: 'm1',
    court: 1,
    slot: 1,
    a: 't1',
    b: 't2',
    sa: 21,
    sb: 17,
    forfeit: '',
    final: true,
  };
  assert.equal(determineWinner(normalMatch), 'a');

  const forfeitMatch: Match = {
    id: 'm2',
    court: 1,
    slot: 2,
    a: 't3',
    b: 't4',
    sa: 0,
    sb: 0,
    forfeit: 'a', // t3 forfeited, so t4 wins
    final: true,
  };
  assert.equal(determineWinner(forfeitMatch), 'b');

  const teams = makeDefaultTeams();
  const standings = calculateStandings(teams, [normalMatch, forfeitMatch]);

  // t1: won normal match (+2 bonus, diff = 21 points scored)
  const t1 = standings.find((s) => s.id === 't1')!;
  assert.equal(t1.bonus, 2);
  assert.equal(t1.pf, 21);
  assert.equal(t1.pa, 17);
  assert.equal(t1.diff, 21);

  // t2: lost normal match (+1 bonus, diff = 17 points scored)
  const t2 = standings.find((s) => s.id === 't2')!;
  assert.equal(t2.bonus, 1);
  assert.equal(t2.diff, 17);

  // t3: forfeited (0 bonus, diff = 0, forfeit = 1)
  const t3 = standings.find((s) => s.id === 't3')!;
  assert.equal(t3.bonus, 0);
  assert.equal(t3.forfeits, 1);
  assert.equal(t3.diff, 0);

  // t4: opponent forfeited (+2 bonus, diff = 0)
  const t4 = standings.find((s) => s.id === 't4')!;
  assert.equal(t4.bonus, 2);
  assert.equal(t4.diff, 0);
});

test('Tournament rule: cumulative points scored rule (e.g. 5/21 gives A1=5 and B1=21)', () => {
  const teams = makeDefaultTeams();
  const testMatch: Match = {
    id: 'm1',
    court: 1,
    slot: 1,
    a: 't1',
    b: 't2',
    sa: 5,
    sb: 21,
    forfeit: '',
    final: true,
  };
  const standings = calculateStandings(teams, [testMatch]);
  const a1 = standings.find((s) => s.id === 't1')!;
  const b1 = standings.find((s) => s.id === 't2')!;

  assert.equal(a1.diff, 5, 'Team A1 diff must equal 5');
  assert.equal(b1.diff, 21, 'Team B1 diff must equal 21');
});

test('Tie resolution allows manual BTC reordering when confirmed', () => {
  const teams = makeDefaultTeams();
  // Simulate tied matches where t1 and t2 have identical bonus and diff
  const matches: Match[] = [
    { id: 'm1', court: 1, slot: 1, a: 't1', b: 't3', sa: 21, sb: 10, forfeit: '', final: true },
    { id: 'm2', court: 2, slot: 1, a: 't2', b: 't4', sa: 21, sb: 10, forfeit: '', final: true },
  ];

  const initialStandings = calculateStandings(teams, matches);
  const tieSig = ['t1', 't2'].sort().join('|');

  // Both have bonus = 2, diff = 21
  assert.equal(initialStandings[0].bonus, 2);
  assert.equal(initialStandings[1].bonus, 2);
  assert.equal(initialStandings[0].diff, 21);
  assert.equal(initialStandings[1].diff, 21);

  // Reorder with BTC confirmation: put t2 above t1
  const tieOrder = { [tieSig]: ['t2', 't1'] };
  const tieConfirm = { [tieSig]: true };

  const reordered = calculateStandings(teams, matches, tieOrder, tieConfirm);
  assert.equal(reordered[0].id, 't2');
  assert.equal(reordered[1].id, 't1');
  assert.equal(reordered[0].tieResolved, true);
});

test('Knockout progression: SF winners advance to Final, losers to 3rd place match', () => {
  const bracket: Bracket = {
    seeds: ['t1', 't2', 't3', 't4'],
    games: {
      sf1: createKnockoutGame('t1', 't4'),
      sf2: createKnockoutGame('t2', 't3'),
      final: null,
      third: null,
    },
  };

  // SF1: t1 defeats t4 (21-15)
  bracket.games.sf1.sa = 21;
  bracket.games.sf1.sb = 15;
  bracket.games.sf1.final = true;

  // SF2: t3 defeats t2 (21-19)
  bracket.games.sf2.sa = 19;
  bracket.games.sf2.sb = 21;
  bracket.games.sf2.final = true;

  syncKnockoutBracket(bracket);

  assert.ok(bracket.games.final);
  assert.ok(bracket.games.third);

  // Final should be t1 vs t3 (SF winners)
  assert.equal(bracket.games.final.a, 't1');
  assert.equal(bracket.games.final.b, 't3');

  // 3rd place match should be t4 vs t2 (SF losers)
  assert.equal(bracket.games.third.a, 't4');
  assert.equal(bracket.games.third.b, 't2');

  // Play Final: t1 wins 21-18
  bracket.games.final.sa = 21;
  bracket.games.final.sb = 18;
  bracket.games.final.final = true;

  // Play 3rd Place match: t2 wins 21-16
  bracket.games.third.sa = 16;
  bracket.games.third.sb = 21;
  bracket.games.third.final = true;

  const awards = getAwards(bracket);
  assert.ok(awards);
  assert.equal(awards.first, 't1', '1st place must be t1');
  assert.equal(awards.second, 't3', '2nd place must be t3');
  assert.equal(awards.third, 't2', '3rd place must be t2');
  assert.equal(awards.fourth, 't4', '4th place must be t4');
});
