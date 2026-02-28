'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'

interface Job {
  id: string
  status: string
}

interface SankeyChartProps {
  jobs: Job[]
}

export default function SankeyChart({ jobs }: SankeyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || jobs.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = containerRef.current.clientWidth
    const height = 400
    const margin = { top: 30, right: 150, bottom: 30, left: 30 }

    svg.attr('width', width).attr('height', height)

    // Add subtle background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')

    const total = jobs.length
    const saved = jobs.filter(j => j.status === 'SAVED').length
    const applied = jobs.filter(j => j.status === 'APPLIED').length
    const interviewing = jobs.filter(j => j.status === 'INTERVIEWING').length
    const offered = jobs.filter(j => j.status === 'OFFERED').length
    const rejected = jobs.filter(j => j.status === 'REJECTED').length

    // Build a realistic pipeline flow
    // Stage 1: Total applications
    // Stage 2: Where they are now
    // Stage 3: Outcomes (for interviewing)

    const nodes: { name: string; color: string }[] = []
    const links: { source: number; target: number; value: number }[] = []

    // Node 0: All applications
    nodes.push({ name: `All Applications  (${total})`, color: '#47662f' })

    // Stage 2 nodes - only add if count > 0
    const stage2: { status: string; label: string; color: string; count: number; idx: number }[] = []

    if (saved > 0) {
      const idx = nodes.length
      nodes.push({ name: `Saved  (${saved})`, color: '#737373' })
      stage2.push({ status: 'SAVED', label: 'Saved', color: '#737373', count: saved, idx })
    }
    if (applied > 0) {
      const idx = nodes.length
      nodes.push({ name: `Applied  (${applied})`, color: '#3b82f6' })
      stage2.push({ status: 'APPLIED', label: 'Applied', color: '#3b82f6', count: applied, idx })
    }
    if (interviewing > 0) {
      const idx = nodes.length
      nodes.push({ name: `Interviewing  (${interviewing})`, color: '#f59e0b' })
      stage2.push({ status: 'INTERVIEWING', label: 'Interviewing', color: '#f59e0b', count: interviewing, idx })
    }
    if (offered > 0) {
      const idx = nodes.length
      nodes.push({ name: `Offered  (${offered})`, color: '#22c55e' })
      stage2.push({ status: 'OFFERED', label: 'Offered', color: '#22c55e', count: offered, idx })
    }
    if (rejected > 0) {
      const idx = nodes.length
      nodes.push({ name: `Rejected  (${rejected})`, color: '#ef4444' })
      stage2.push({ status: 'REJECTED', label: 'Rejected', color: '#ef4444', count: rejected, idx })
    }

    // Links from total to each status
    stage2.forEach(s => {
      links.push({ source: 0, target: s.idx, value: s.count })
    })

    if (links.length === 0) return

    // Create gradient defs
    const defs = svg.append('defs')

    const sankeyGenerator = sankey<{ name: string; color: string }, {}>()
      .nodeId((d: any) => d.index)
      .nodeWidth(14)
      .nodePadding(24)
      .nodeAlign((node: any) => node.depth)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])

    const graph = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    })

    // Create gradients for each link
    graph.links.forEach((link: any, i: number) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `link-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', link.source.x1)
        .attr('x2', link.target.x0)

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', link.source.color)
        .attr('stop-opacity', 0.4)

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', link.target.color)
        .attr('stop-opacity', 0.4)
    })

    // Draw links with gradients
    svg.append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', (d: any, i: number) => `url(#link-gradient-${i})`)
      .attr('stroke-width', (d: any) => Math.max(3, d.width))
      .style('mix-blend-mode', 'multiply')
      .on('mouseover', function() {
        d3.select(this).attr('stroke-opacity', 0.8)
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-opacity', 1)
      })

    // Draw nodes with rounded corners and shadow
    svg.append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => Math.max(4, d.y1 - d.y0))
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => d.color)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))')

    // Draw labels
    svg.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', (d: any) => d.x1 + 12)
      .attr('y', (d: any) => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', (d: any) => d.color)
      .attr('letter-spacing', '-0.01em')
      .text((d: any) => d.name)

    // Add count badges on nodes
    svg.append('g')
      .selectAll('text.count')
      .data(graph.nodes)
      .join('text')
      .attr('class', 'count')
      .attr('x', (d: any) => (d.x0 + d.x1) / 2)
      .attr('y', (d: any) => d.y0 - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', (d: any) => d.color)
      .text((d: any) => {
        const match = d.name.match(/\((\d+)\)/)
        return match ? match[1] : ''
      })

  }, [jobs])

  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Add applications to see your flow.</p>
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" style={{ height: 400 }} />
    </div>
  )
}
