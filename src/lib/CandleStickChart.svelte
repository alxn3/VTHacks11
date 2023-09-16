<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import Button from './Button.svelte';

	let el: HTMLDivElement;

	let from = new Date(0);

	export let historyData: {
		date: Date;
		open: number;
		high: number;
		low: number;
		close: number;
	}[] = Array.from({ length: 100 }, () => ({
		date: new Date(2018, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
		open: Math.random() * 100,
		high: Math.random() * 100,
		low: Math.random() * 100,
		close: Math.random() * 100
	})).sort((a, b) => a.date.getTime() - b.date.getTime());

	const createChart = () => {
		d3.select(el).select('svg').remove();

		const width = el.clientWidth;
		const height = el.clientHeight;
		const marginTop = 20;
		const marginRight = 30;
		const marginBottom = 30;
		const marginLeft = 40;

		const data = historyData.filter((d) => d.date.getTime() > from.getTime());

		const minDate = d3.min(data, (d) => d.date);
		const maxDate = d3.max(data, (d) => d.date);

		if (!minDate || !maxDate) return;

		const x = d3
			.scaleBand<Date>()
			.domain(d3.timeDay.range(minDate, new Date(maxDate.getTime() + 86400000)))
			.range([marginLeft, width - marginRight])
			.padding(0.2);

		const y = d3
			.scaleLog()
			.domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)] as [number, number])
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
					.tickValues(d3.timeMonday.every(width > 720 ? 1 : 2)!.range(minDate, maxDate))
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

		// Create a group for each day of data, and append two lines to it.
		const g = svg
			.append('g')
			// .attr('stroke-linecap')
			.attr('stroke', 'white')
			.selectAll('g')
			.data(data)
			.join('g')
			.attr('transform', (d) => {
				return `translate(${x(d.date)},0)`;
			});

		g.append('line')
			.attr('y1', (d) => y(d.low))
			.attr('y2', (d) => y(d.high));

		g.append('line')
			.attr('y1', (d) => y(d.open))
			.attr('y2', (d) => y(d.close))
			.attr('stroke-width', x.bandwidth())
			.attr('stroke', (d) =>
				d.open > d.close ? d3.schemeSet1[0] : d.close > d.open ? d3.schemeSet1[2] : d3.schemeSet1[8]
			);

		// Append a title (tooltip).
		const formatDate = d3.utcFormat('%B %-d, %Y');
		const formatValue = d3.format('.2f');
		const formatChange = (
			(f) => (y0, y1) =>
				f((y1 - y0) / y0)
		)(d3.format('+.2%'));

		g.append('title').text(
			(d) => `${formatDate(d.date)}
                    Open: ${formatValue(d.open)}
                    Close: ${formatValue(d.close)} (${formatChange(d.open, d.close)})
                    Low: ${formatValue(d.low)}
                    High: ${formatValue(d.high)}`
		);
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
		'1 fr': Date.now() - 60 * 60 * 1000
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
						createChart();
					}}
				>
					{time}
				</button>
			{/each}
		</div>
	</div>
</div>
