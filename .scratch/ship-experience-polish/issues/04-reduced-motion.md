# Reduced-motion static equivalents

Type: task
Status: resolved
Blocked by: 01, 02, 03

## Question

Ensure `prefers-reduced-motion: reduce` keeps static teaching colors/labels/highlights while killing loop/packets/scale/stagger; panel flash ≤200ms or instant.

## Answer

Updated reduce media query: kill finding one-shot + bottleneck transform; hide packets/bursts; summary flash becomes instant static style (no animation). State colors/labels remain.
