<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import Button from './Button.svelte';

	let el: HTMLDivElement;

	let from = new Date(0);

	export let againstData: {
		date: Date;
		againstAsk: number;
		againstBid: number;
	}[];

	export let forData: {
		date: Date;
		forBid: number;
		forAsk: number;
	}[];

	let dur: 'day' | 'hour' | 'minute' = 'day';

	const createChart = () => {
		d3.select(el).select('svg').remove();

		const width = el.clientWidth;
		const height = el.clientHeight;
		const marginTop = 40;
		const marginRight = 30;
		const marginBottom = 30;
		const marginLeft = 40;

		let minValue = Infinity;
		let maxValue = -Infinity;
		const historyData = [
			...againstData.map((d) => {
				const date = new Date(d.date.getTime());
				minValue = Math.min(minValue, d.againstAsk, d.againstBid);
				maxValue = Math.max(maxValue, d.againstAsk, d.againstBid);
				if (dur === 'day') date.setHours(0, 0, 0, 0);
				else if (dur === 'hour') date.setMinutes(0, 0, 0);
				else if (dur === 'minute') date.setSeconds(0, 0);
				return {
					date: d.date,
					forAsk: NaN,
					forBid: NaN,
					againstAsk: d.againstAsk,
					againstBid: d.againstBid
				};
			}),
			...forData.map((d) => {
				const date = new Date(d.date.getTime());
				minValue = Math.min(minValue, d.forAsk, d.forBid);
				maxValue = Math.max(maxValue, d.forAsk, d.forBid);
				if (dur === 'day') date.setHours(0, 0, 0, 0);
				else if (dur === 'hour') date.setMinutes(0, 0, 0);
				else if (dur === 'minute') date.setSeconds(0, 0);
				return {
					date: date,
					forAsk: d.forAsk,
					forBid: d.forBid,
					againstAsk: NaN,
					againstBid: NaN
				};
			})
		];

		console.log(historyData);

		const data = historyData.filter((d) => d.date.getTime() > from.getTime());

		const minDate = d3.min(data, (d) => d.date);
		const maxDate = d3.max(data, (d) => d.date);

		if (!minDate || !maxDate) return;

		var color = d3.scaleOrdinal().domain(Object.keys(data[0])).range(d3.schemeSet1);

		const x = d3
			.scaleBand<Date>()
			.domain(d3.timeHour.range(minDate, new Date(maxDate.getTime() + 86400000)))
			.range([marginLeft, width - marginRight])
			.padding(0.2);

		const y = d3
			.scaleLinear()
			.domain([minValue, maxValue])
			.rangeRound([height - marginBottom, marginTop]);

		// Create the SVG container.
		const svg = d3.select(el).append('svg').attr('viewBox', [0, 0, width, height]);

		// Append the axes.
		svg
			.append('g')
			.attr('transform', `translate(0,${height - marginBottom})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues(d3.timeDay.every(width > 720 ? 1 : 2)!.range(minDate, maxDate))
					.tickFormat(d3.utcFormat('%-m/%-d'))
			)
			.call((g) => g.select('.domain').remove());

		svg
			.append('g')
			.attr('transform', `translate(${marginLeft},0)`)
			.call(
				d3
					.axisLeft(y)
					.tickFormat(d3.format('$~f'))
					.tickValues(d3.scaleLinear().domain(y.domain()).ticks())
			)
			.call((g) =>
				g
					.selectAll('.tick line')
					.clone()
					.attr('stroke-opacity', 0.2)
					.attr('x2', width - marginLeft - marginRight)
			)
			.call((g) => g.select('.domain').remove());

		const line = d3
			.line<{ date: Date; value: number }>()
			.defined((d) => !isNaN(d.value))
			.x((d) => x(d.date)!)
			.y((d) => y(d.value));

		// Append a title (tooltip).
		const formatDate = d3.utcFormat('%B %-d, %Y');
		const formatValue = d3.format('.2f');
		const formatChange = (
			(f) => (y0, y1) =>
				f((y1 - y0) / y0)
		)(d3.format('+.2%'));

		const space = [0, 70, 140, 240];

		for (const key of Object.keys(data[0])) {
			if (key === 'date') continue;
			svg
				.append('path')
				.attr('fill', 'none')
				.attr('stroke', color(key))
				.attr('stroke-width', 1.5)
				.attr(
					'd',
					line(data.filter((d) => !isNaN(d[key])).map((d) => ({ date: d.date, value: d[key] })))
				)
				.attr('title', key);
		}
		svg
			.selectAll('mydots')
			.data(Object.keys(data[0]).filter((d) => d !== 'date'))
			.enter()
			.append('circle')
			.attr('cx', (d, i) => marginLeft / 2 + space[i])
			.attr('cy', marginTop / 2)
			.attr('r', 4)
			.style('fill', function (d) {
				return color(d);
			});

		// Add one dot in the legend for each name.
		svg
			.selectAll('mylabels')
			.data(Object.keys(data[0]).filter((d) => d !== 'date'))
			.enter()
			.append('text')
			.attr('x', (d, i) => marginLeft / 2 + space[i] + 10)
			.attr('y', marginTop / 2) // 100 is where the first dot appears. 25 is the distance between dots
			.style('fill', function (d) {
				return color(d);
			})
			.text(function (d) {
				return d;
			})
			.attr('text-anchor', 'left')
			.style('alignment-baseline', 'middle')
			.style('font-size', '12px');
	};

	onMount(() => {
		createChart();
	});

	let times: Record<string, number> = {
		All: 0,
		'10yr': Date.now() - 10 * 365 * 24 * 60 * 60 * 1000,
		'5yr': Date.now() - 5 * 365 * 24 * 60 * 60 * 1000,
		'1 yr': Date.now() - 365 * 24 * 60 * 60 * 1000,
		'1 m': Date.now() - 30 * 24 * 60 * 60 * 1000,
		'24 hr': Date.now() - 24 * 60 * 60 * 1000,
		'12 hr': Date.now() - 12 * 60 * 60 * 1000,
		'6 hr': Date.now() - 6 * 60 * 60 * 1000,
		'1 hr': Date.now() - 60 * 60 * 1000
	};
</script>

<div class="w-full h-full bg-black p-4 rounded-lg flex flex-col">
	<div class="flex-1" bind:this={el} />
	<!-- Range selector, All time, 10 years, 5 years, 1 year, month, day, hour -->
	<div class="flex justify-between">
		<div class="flex gap-1">
			{#each Object.keys(times) as time}
				<button
					class="text-sm py-1 px-2 text-green-500"
					on:click={() => {
						from = new Date(times[time]);
						// time contains 'hr'
						if (time.includes('hr')) dur = 'hour';
						else if (time === '1 hr') dur = 'minute';
						else dur = 'day';
						createChart();
					}}
				>
					{time}
				</button>
			{/each}
		</div>
	</div>
</div>
