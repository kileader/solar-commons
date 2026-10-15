# Solar Commons | Chapter 2: The Quiet Index

**Provisional production script.** The player is Mara. These are authored branches with a common reunion. Line IDs are design labels; Cid may adapt to the project's exact schema but should keep them stable once the text is finalized. Each `**ID / SPEAKER:**` passage is intended to become a single voice file *eventually*, not yet.

## Scene 1: Larkhaven after dark (nocturnal canal)

**qi-arrival-01 / NARRATOR:** Night changes Larkhaven without erasing it. Gardens spill over canal railings, but the city's brightness narrows to amber lanterns, dark shop windows, and reflections trembling beneath pedestrian bridges. This quarter seems to prefer questions asked after sunset.

**qi-arrival-02 / MARA:** "The Quiet Index." That's either a restoration studio or an exceptionally polite haunting. I hope they have tea.

**qi-arrival-03 / KITE:** Both of the museum leads eventually bring us here. The records refer to an independent conservator named Ilex Vale. The shop is open; I suggest we introduce ourselves before concluding it's haunted.

**qi-arrival-04 / MARA:** You're taking all the fun out of fieldwork. Come on.

> **Conditional on museum lead (short text variation, no hard promise of actual sent messages):**
> - `voices`: Their interest is the missing refuge testimony, and the collection reference points to Ilex.
> - `stair`: They need context on the listening-line circuit before requesting safe physical access; the preservation notes point to Ilex.
>
> **Implementation note:** The opening line above is a generic shared version. Cid can present one concise lead-specific line instead of qi-arrival-03 if needed, with its own new dialogue ID. Do not make the same line ID mean two different recordings.

## Scene 2: First impressions (Quiet Index interior)

**qi-intro-01 / NARRATOR:** The Quiet Index smells faintly of tea and warm electronics. Damaged recordings rest in padded trays beneath handwritten labels. At a restoration bench sits a figure in dark layered fabrics, one eye shining amber beside an exposed ceramic cranial lattice. Their white-and-brass prosthetic fingers adjust a delicate instrument.

**qi-intro-02 / ILEX:** Welcome. Please don't touch anything older than you. If you're looking for the Hall of Waters, you've taken a rather interesting wrong turn.

**qi-intro-03 / MARA:** Actually, I'm hoping we've found the right place. I'm Mara, and I've brought a companion. Kite, would you like to introduce yourself?

**qi-intro-04 / ILEX:** An independent intelligence? Certainly. My guest channel is open, but public presence only, please. I prefer keeping my private senses to myself.

**qi-intro-05 / NARRATOR:** Kite requests permission to share their avatar and voice. Ilex accepts. A familiar shape of articulated facets and narrow fins unfolds in Ilex's augmented vision; Kite's subtly synthetic voice arrives through the auditory interface. There's no physical hologram in the room, and neither person's private sensory stream is shared.

**qi-intro-06 / KITE:** Hello, Ilex. I'm Kite. Thank you for the invitation. I particularly admire your optical interface design.

**qi-intro-07 / ILEX:** And I admire yours. Those moving facets are exquisite. Did Mara design you, or have you been doing your own renovations?

**qi-intro-08 / KITE:** Mara selected my original geometry. I've made several modifications since then, including changes she considers unnecessarily elaborate.

**qi-intro-09 / MARA:** I just think all those moving fins make you harder to follow. They used to be a perfectly respectable little diamond.

**qi-intro-10 / ILEX:** More fins? Darling, you've shown extraordinary restraint. I once spent six months redesigning the joints in my left hand because I disliked the way they looked while holding a teacup.

**qi-intro-11 / NARRATOR:** Ilex demonstrates with a graceful turn of their prosthetic fingers, then lifts a sealed, flood-damaged media cartridge from its padded case.

**qi-intro-12 / ILEX:** Now, you two share perception, don't you? Interesting arrangement. I've always preferred augmenting my own senses rather than inviting another intelligence into the process.

**qi-intro-13 / MARA:** It's voluntary, and Kite isn't just an extension of my brain. We work together. Besides, with that much hardware in your head, you've hardly chosen the minimalist approach.

**qi-intro-14 / ILEX:** True, but my hardware doesn't interrupt me in the middle of a thought.

**qi-intro-15 / KITE:** That sounds lonely.

**qi-intro-16 / ILEX:** That sounds like something an interruption would say.

**qi-intro-17 / MARA:** Okay, I like them.

**qi-intro-18 / KITE:** You say that about anyone who insults me elegantly.

**qi-intro-19 / ILEX:** Then I believe we're going to get along. Now, what brings an ocean researcher and a very articulate geometric sculpture into my archive?

**qi-intro-20 / MARA:** The Night of Two Waters. Specifically, someone who was still speaking through the refuge's listening line after the last ferry left.

**qi-intro-21 / NARRATOR:** Ilex's fingers stop moving. The warm light in their augmented eye contracts to a narrow amber ring.

**qi-intro-22 / ILEX:** Well. That's a considerably more interesting introduction than I expected. I think you'd better sit down.

## Scene 3: The recording and the approach (Quiet Index interior)

**qi-record-01 / NARRATOR:** Ilex gestures to chairs beside the bench. They settle the damaged cartridge in a protective reader, and an irregular waveform appears across the work surface. Its peaks stutter in the amber light.

**qi-record-02 / ILEX:** I have a recording associated with the lower refuge. Its original condition was terrible, and the surviving documentation is incomplete. I can play a short excerpt, but I won't distribute copies. The donor imposed restrictions, and I take those seriously.

**qi-record-03 / MARA:** We're not here to make a documentary. The handover says someone kept that line open. We want to understand what happened, and what it might tell us about the place beneath the breakwater.

**qi-record-04 / ILEX:** Before I play anything, tell me how you're approaching it. The question you ask first will shape what we examine together.

### Player choice: How does Mara approach Ilex?

**Analysis:** Establish what the recording can prove. (`analysis`)

**Empathy:** Understand why the recording is protected. (`empathy`)

**Intuition:** Ask what makes this particular recording unusual. (`intuition`)

### Branch A: Analysis

**qi-analysis-01 / MARA:** Start with the evidence. Where was it recovered, how do you know it belongs to the refuge, and what did restoration change? I'd rather establish what we're actually listening to before deciding what it means.

**qi-analysis-02 / ILEX:** It came from a flood-damaged family collection, annotated as east breakwater. The format fits equipment from the Unbinding, but that doesn't prove provenance. More interestingly, someone edited it before I received it. There's a missing segment, and I don't know why it was removed.

**qi-analysis-03 / KITE:** Then we should distinguish original capture, later intervention, and modern reconstruction. A consistent feature could matter, but the cleaned version isn't a transparent window into the past.

**Field note: An early splice / missing section.** The recording was altered; the purpose of the alteration is unknown.

### Branch B: Empathy

**qi-empathy-01 / MARA:** You could have turned us away. Instead, you're considering sharing something you've worked hard to protect. Who are you worried about hurting?

**qi-empathy-02 / ILEX:** The speaker, first of all. And a family who feared an incomplete recording could turn someone into a hero, a villain, or public property. They allowed limited research access, not unrestricted release. Whether the original speaker would have approved even that much is a harder question.

**qi-empathy-03 / KITE:** So you're balancing the speaker's autonomy against a legitimate public interest in history. Those obligations can conflict even when everyone involved is acting in good faith.

**Field note: Consent and donor limits.** Ilex is protecting a recording subject and family, not merely hiding a secret.

### Branch C: Intuition

**qi-intuition-01 / MARA:** You've probably restored a thousand damaged recordings. Why does this one still keep you awake?

**qi-intuition-02 / ILEX:** The museum presents dawn as an ending. The last ferry returned, the streets began to clear, and the city survived. But this recording sounds like someone making a decision to stay. I keep wondering what could have mattered enough.

**qi-intuition-03 / KITE:** The handover calls the line attended, not abandoned. That could suggest purpose, but it doesn't establish whether staying was voluntary. We need to resist a convenient story even when it moves us.

**Field note: Someone remained for a reason?** The possibility is compelling, but it's an interpretation, not established fact.

## Scene 4: Playback (shared, no automatic choice)

**qi-play-01 / ILEX:** All right. An excerpt. You're welcome to examine what you hear, but please don't record or transmit it. I'd also recommend waiting until the speaker finishes before deciding who they are.

**qi-play-02 / KITE:** Agreed. I'll keep analysis local to this session.

**qi-play-03 / NARRATOR:** The room dims. Beneath a bed of noise, a weary voice emerges. Water drips nearby. A low electrical hum continues beneath the words.

**qi-play-04 / UNKNOWN SPEAKER (recording):** Shore, do you still have us? ... Yes. I know the ferries are gone. No, don't close it yet. She's still here. ... I said she's still here. She can hear you. Just keep the line open.

**qi-play-05 / NARRATOR:** The speaker falls silent. Two clicks follow, then a faint disturbance that might be another signal. The surviving recording cuts off. The identity of the speaker, of "she," and of any other presence remains unknown.

**qi-play-06 / MARA:** They're talking to someone on shore, but also about someone in the refuge. Whoever "she" was, the speaker believed she could hear the other end of the line. That's more than a simple request for rescue.

**qi-play-07 / KITE:** It's consistent with several participants, but we can't identify them. The clicks could be switching noise rather than replies. What interests me is the insistence on keeping communication open after the last ferry.

**qi-play-08 / ILEX:** Exactly. The original system was built for emergency communication, but maintenance records mention auxiliary circuits. We don't know which were still active that night. Now you understand why I don't have a neat conclusion to give you.

## Scene 5: Stopping point (shared, echo chosen museum lead)

**qi-end-01 / MARA:** We have an unknown speaker, someone they refused to leave behind, and a line running toward a structure we've only just found. I'm not calling it proof. But I'm definitely not calling it nothing.

**qi-end-02 / ILEX:** A better question, certainly. You're welcome to investigate, provided you don't mistake enthusiasm for evidence. I can help you find the remaining circuit diagrams and donor notes, subject to the same restrictions.

**qi-end-03 / KITE:** We should continue along the lead we selected at the museum, informed by what we learned here. We haven't established who spoke, how many were present, or whether the present harbor anomaly has anything to do with this old recording.

**qi-end-04 / NARRATOR:** Outside, music curls through the canal district. The harbor waits beyond the bridges. Ilex returns the recording to its case, and Mara realizes that an old civic ending has become a new question.

> **End card/field note:** `The Quiet Index` complete. Preserve the user's museum lead (`stair` or `voices`) as the next investigation focus. The player's conversation approach affects the saved insight. No additional lead selection is necessary here because the museum already asked the player to choose one.

## Editorial / production guardrails

- Every labeled line is one intended audio clip, not one sentence per clip; retain short lines that make the comedy work. **No new voiced audio yet.**
- Ilex uses they/them. Kite is an autonomous agent with explicitly authorized, limited AR presence; avoid accidental "floating hologram" staging.
- The recording might be degraded in a way that sounds evocative, but don't build plot deductions on implausibly precise forensic claims.
- A donor's restrictions, rather than universal privacy law, explain Ilex's choice to offer an excerpt rather than a copy.
- Keep the Unbinding framing consistent with the current continuity correction: AI autonomy uprising began before the flood, and reforms followed. Don't date it more precisely.
- Don't conflate the flood's historic listening line with the present unexplained harbor light/structure; these are hypotheses, not confirmed facts.
- The antique media imagery is aesthetic. Actual archival data should be legible as plausible physical storage, not magical sentient recordings.
