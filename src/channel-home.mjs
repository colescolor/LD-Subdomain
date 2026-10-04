export const channelHome = `
<section class="connection-home" data-channel-home>
 <div class="connection-copy">
  <section class="connection-chapter connection-intro" id="connection-start">
   <p class="connection-kicker"><i></i> LOCKDOWEL / THE CONNECTION STUDIO</p>
   <h1>Small part.<br>Big <em>possibilities.</em></h1>
   <p>Get close to the connection.<br>Then see where it can take you.</p>
   <button class="connection-play-link" type="button" data-channel-start><span>▶</span> Watch it come together</button>
   <a class="connection-text-button" href="/parts/">View our 3D library <span>↗</span></a>
   <div class="connection-quick-links"><a href="#connection-movement">The parts ↓</a><a href="#connection-scale">The ideas ↓</a><a href="#connection-next">Your project ↓</a></div>
   <div class="connection-spec"><span>E900BP</span><span>DRAG THE MODEL. SEE THE CONNECTION.</span></div>
  </section>
  <section class="connection-chapter connection-discover" id="connection-movement">
   <p class="connection-kicker">01 / GET YOUR HANDS ON THE HARDWARE</p>
   <h2>A whole library.<br><em>Every angle.</em></h2>
   <p>Spin the parts. Compare the shapes. Find the part number. Explore 24 interactive models in one place.</p>
   <p class="connection-model-prompt">Choose one of the three 3D squares in the viewer. Spin it, get close, then explore the full collection.</p>
   <a class="connection-text-button" href="/parts/">Go see the full library <span>↗</span></a>
  </section>
  <section class="connection-chapter connection-discover" id="connection-scale">
   <p class="connection-kicker">02 / FROM HARDWARE TO AN IDEA</p>
   <h2>See the parts.<br><em>Picture the whole.</em></h2>
   <p>Start with the 3D model. Look at the design photo afterwards to see the bigger idea and its drawing details.</p>
   <a class="connection-study-preview" href="/drawings/boat-table/"><img src="/assets/boat-table-exploded.png" width="1191" height="842" alt="Exploded boat table design study showing its panels and connections" loading="lazy"><span>BOAT TABLE / DESIGN STUDY <b>↗</b></span></a>
   <div class="connection-study-links"><a href="/drawings/open-cubby/">Open cubby ↗</a><a href="/drawings/angled-table/">Angled table ↗</a><a href="/projects/boat-table/">Interactive project ↗</a></div>
   <a class="connection-text-button" href="/drawings/">Look at the design photo afterwards <span>↗</span></a>
  </section>
  <section class="connection-chapter connection-discover" id="connection-tools">
   <p class="connection-kicker">03 / FIND YOUR NEXT STEP</p>
   <h2>Put the idea<br><em>to work.</em></h2>
   <a class="connection-application-preview" href="/explore/"><img src="/assets/cabinetry.jpg" width="640" height="400" alt="Kitchen cabinetry application" loading="lazy"><span><strong>Explore applications</strong><small>Furniture. Cabinetry. Wall panels.</small></span><b>↗</b></a>
   <div class="connection-resource-links">
    <a href="/guides/"><span><strong>Read the technical guides</strong><small>Connections, assembly, and planning.</small></span><b>↗</b></a>
    <a href="/how-to/e3259bm/"><span><strong>Watch the original assembly film</strong><small>See the E3259BM connection in motion.</small></span><b>↗</b></a>
    <a href="/savings/"><span><strong>Explore assembly savings</strong><small>Try your own time and labor scenario.</small></span><b>↗</b></a>
   </div>
  </section>
  <section class="connection-chapter connection-last" id="connection-next">
   <p class="connection-kicker">04 / YOUR NEXT CONNECTION</p>
   <h2>What will<br><em>you build?</em></h2>
   <p>Bring your drawing, your material, or your first idea. Let's find the next step for your project.</p>
   <a class="button" href="/start-project/">Bring your project <span>↗</span></a>
   <p class="connection-fine">E900BP nylon, E3259BM metal mini, and E910BP H-clip. Models and assembly routing are visual references; use product documentation for production dimensions.</p>
  </section>
 </div>
 <aside class="connection-stage-column" aria-label="Channel lock interactive showcase">
  <div class="connection-stage">
   <div class="connection-stage-top"><span><i></i> <b data-channel-sku>E900BP</b></span><span data-channel-status>LOADING THE CONNECTION</span></div>
   <div class="connection-viewport" data-channel-viewport role="img" aria-label="Rotating E900BP nylon channel lock. Drag to rotate, or use the view controls. Play to see mounting, channel engagement, and a wider view of the same locked joint."><div class="connection-loading">THE CONNECTION<span>A small part. A closer look.</span></div></div>
   <span class="connection-watermark" aria-hidden="true">E900BP</span>
   <div class="connection-caption"><span data-channel-phase>00 / THE CHANNEL LOCK</span><p data-channel-caption>A little green part. A world of possibility.</p></div>
   <div class="connection-model-picker" role="group" aria-label="Choose a 3D part">
    ${[['e900bp','E900BP'],['e3259bm','E3259BM'],['e910bp','E910BP']].map(([id,sku])=>`<button type="button" data-home-part="${id}" aria-pressed="${id==='e900bp'}" aria-label="Inspect ${sku} in 3D"><span class="model-mini" data-model-preview="${id}"><span>3D</span></span><span>${sku}</span></button>`).join('')}
   </div>
   <div class="connection-after" hidden data-channel-after><span>That's the connection. Now explore every angle.</span><a href="/parts/">Go see the full library ↗</a></div>
   <div class="connection-controls">
    <div class="connection-main-controls"><button type="button" class="connection-play" data-channel-play aria-label="Play connection sequence">▶ <span>Play the connection</span></button><button type="button" data-channel-reset>↺ Reset</button><button type="button" data-channel-spin aria-pressed="true">Pause rotation</button></div>
    <div class="connection-timeline"><label for="connection-progress">SEQUENCE</label><input id="connection-progress" type="range" min="0" max="16" step="0.01" value="0" aria-label="Connection animation progress"><output for="connection-progress" data-channel-time>0:00 / 0:16</output></div>
    <div class="connection-chapters" role="group" aria-label="Sequence chapters"><button type="button" data-channel-step="0" aria-pressed="true">Inspect</button><button type="button" data-channel-step="4.4" aria-pressed="false">Mount</button><button type="button" data-channel-step="8.4" aria-pressed="false">Seat</button><button type="button" data-channel-step="10.7" aria-pressed="false">Lock</button><button type="button" data-channel-step="16" aria-pressed="false">Joint</button></div>
   </div>
   <div class="connection-stage-foot"><span>DRAG TO ROTATE <b>·</b> <button type="button" data-channel-orbit="-1" aria-label="Rotate view left">←</button><button type="button" data-channel-orbit="1" aria-label="Rotate view right">→</button></span><span data-channel-view-note>REFERENCE MODEL / DRAG TO EXPLORE</span></div>
   <noscript><style>.connection-loading,.connection-controls,.connection-caption,.connection-model-picker{display:none}.connection-fallback-link[hidden]{display:block!important}</style></noscript><a class="connection-fallback-link" href="/how-to/e3259bm/" hidden>Watch the connector film ↗</a>
  </div>
 </aside>
</section>`;
