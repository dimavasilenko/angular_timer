import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, fromEvent, interval, timer, of} from 'rxjs';
import {merge, takeUntil, scan, map, switchMap} from 'rxjs/operators';
import {exhaustMap, take} from 'rxjs/operators';
import {padZero} from '../utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
  timerValue = 0;
  timer$: Observable<any>;

  startTimer() {
    const startButton$ = fromEvent(document.getElementById('start'), 'click');
    const stopButton$ = fromEvent(document.getElementById('stop'), 'click');
    const resetButton$ = fromEvent(document.getElementById('reset'), 'click');
    const waitButton$ = fromEvent(document.getElementById('wait'), 'click');

    const waitButton = waitButton$.pipe(exhaustMap(() =>
      waitButton$.pipe(take(2), takeUntil(interval(300)),
      )));

    const startButton = startButton$.pipe(
      switchMap(() => timer(this.timerValue, 1000)),
    );

    this.timer$ = of(this.timerValue)
      .pipe(
        merge(
          startButton.pipe(
            takeUntil(resetButton$),
            takeUntil(waitButton),
            takeUntil(stopButton$),
            map(() => 1),
          ),
          resetButton$.pipe(
            map(() => 0),
          ),
        ),

        scan((acc: number, val: number) => val === 0 ? 0 : acc + val),
      );

    this.timer$.subscribe((value: number) => {
      this.timerValue = value;
    });
  }


  getTimerSeconds() {
    return padZero(this.timerValue % 60);
  }

  getTimerMinutes() {
    return padZero(Math.floor(this.timerValue / 60) % 60);
  }

  getTimerHours() {
    return padZero(Math.floor(this.timerValue / 3600));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
