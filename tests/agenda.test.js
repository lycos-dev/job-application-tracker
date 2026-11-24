import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nextActions } from '../src/lib/agenda.js'

test('agenda prioritizes overdue and imminent deadlines, then follow-ups, then the week ahead',() => {
  const today='2026-11-24'
  const saved=day=>({company:'Company',stage:'Saved',deadline:'2026-'+day})
  const waiting={company:'Waiting',stage:'Applied',stage_changed_at:'2026-11-11T12:00:00'}
  const recent={...waiting,last_followed_up_at:'2026-11-22T12:00:00'}
  const result=nextActions([saved('12-02'),saved('11-30'),recent,waiting,saved('11-22'),saved('11-25'),
    {...saved('11-24'),stage:'Closed'}],today)
  assert.deepEqual(result.map(x=>x.row),[saved('11-22'),saved('11-25'),waiting,saved('11-30')])
})
