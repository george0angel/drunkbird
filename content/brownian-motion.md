# Brownian Motion

## Introduction and Definition

In 1827, Robert Brown was studying pollen grains. He noticed these tiny particles followed continuous but jagged paths of motion. The mathematical object constructed to model such a motion is named the Wiener process, after Norbert Wiener, but is also referred to as the Brownian motion.

::: def Brownian Motion

Let $\{W_t\}_{t\ge 0}$ be a continuous-time stochastic process such that:

1. $W_0=0$ almost surely and has continuous sample paths.
2. $W$ has independent increments, that is, $W_{t+u}-W_t$ for $u>0$ is independent of all values $W_s$ for $0\le s\le t$.
3. For all $u\ge 0$,

   $$
   W_{t+u}-W_t \sim \mathcal{N}(0,u).
   $$

Then $W$ is called a **standard Brownian motion** in one dimension.

:::

We call this "standard" because its initial position is $0$, it has zero drift and has unit variance. More generally we can set $W_0=x$ almost surely and have drift $\mu$ and variance $\sigma^2$ when

$$
W_{t+u}-W_t \sim \mathcal{N}(\mu,\sigma^2u).
$$

Supposing $X$ is our non-standard Brownian motion and $W$ is standard, then we can write

$$
X_t\overset{d}{=}W_t+x+\mu t
\andtext
dX_t=\mu\,dt+\sigma\,dW_t.
$$

Toying with these variables on our simulator **[hyperlink here]** one can see that drift, in a sense, causes the motion to prefer moving in a certain direction depending on the sign of $\mu$, and how much it prefers to move in said direction is quantified by the size of $\mu$. Then we can see as $\sigma^2$ increases the motion gets, in a manner of speaking, more jagged or more random.

It's natural to ask why the three conditions in the definition have been chosen.

1. The first fixes a start point, which is arbitrary, but also specifies paths must be continuous, as observed by Brown.
2. The second says no motion from the past impacts the future motion; the only important information is a particle's current position (those familiar with Markov processes may know this as the Markov property).
3. Finally, the third is a derivative of the _Central Limit Theorem_. Without going into detail about the construction of this process, one can think of Brownian motion as infinitesimally small steps taken at infinitesimally separated times. So, under the appropriate scaling, sums of these steps should tend to a normal random variable as implied by the CLT.

The next natural question any mathematician should ask is: **is Brownian motion well-defined?** That is, does a process even exist that satisfies the three conditions and, if it does, is it unique? The answer of course is yes (otherwise this page wouldn't exist either).

::: thm Existence of the Brownian Motion

The Brownian motion is well-defined, it exists and is unique.

:::

::: deeper Lévy's Construction of Brownian Motion

The most well-known construction of the process is by Lévy. The general idea is to consider the dyadic expansion of the real numbers on the interval $[0,1]$ and attach normal random variables to each of these points. Let's describe the first couple steps and leave the heavy lifting to you, the reader.

We consider the collection of random variables

$$
\curly{Z_{n,k}:n\in\mathbb{N},\,k=1,3,\ldots,2^n-1}
$$

where each

$$
Z_{n,k}\overset{iid}{\sim}\mathcal{N}(0,1).
$$

So now every dyadic number in the expansion over $(0,1]$ has an associated random variable. For example, $Z_{1,1}$ corresponds to $1/2$, $Z_{3,5}$ corresponds to $5/8$, and $Z_{5,13}$ corresponds to $13/32$.

- _(Level 0)_ Set $W_0=0$ and $W_1=Z_{0,1}$. Define $(W^{(0)}_t)_{0\le t\le 1}$ as the linear interpolation between $W_0$ and $W_1$.

- _(Level 1)_ Set

  $$
  W_{\frac{1}{2}}
  =
  \frac{W_0+W_1}{2}
  +
  \frac{1}{2}Z_{1,1}.
  $$

  Define $(W^{(1)}_t)_{0\le t\le 1}$ as the linear interpolation between $W_0$, $W_{1/2}$ and $W_1$ so that

  $$
  W^{(1)}_0=0,\qquad
  W^{(1)}_{1/2}=W_{1/2},\qquad
  W^{(1)}_1=W_1.
  $$

- _(Level 2)_ Set

  $$
  W_{\frac{1}{4}}
  =
  \frac{W_0+W_{1/2}}{2}
  +
  \frac{1}{2\sqrt{2}}Z_{2,1}
  \andtext
  W_{\frac{3}{4}}
  =
  \frac{W_{1/2}+W_1}{2}
  +
  \frac{1}{2\sqrt{2}}Z_{2,3}.
  $$

  Define $(W^{(2)}_t)_{0\le t\le 1}$ as the linear interpolation between the $W_{k/4}$ such that $W^{(2)}_{k/4}=W_{k/4}$ for each $k=0,\ldots,4$.

- _(Level $n$)_ In general, for $n\in\mathbb{N}$ and $k=1,3,\ldots,2^n-1$, set

  $$
  W_{\frac{k}{2^n}}
  =
  \frac{
    W_{(k-1)/2^n}
    +
    W_{(k+1)/2^n}
  }{2}
  +
  \frac{1}{2^{(n+1)/2}}Z_{n,k}
  $$

  and linearly interpolate $W^{(n)}_t$ between the $W_{k/2^n}$ such that

  $$
  W_{k/2^n}=W^{(n)}_{k/2^n}.
  $$

One then shows that $W^{(n)}$ converges, that is,

$$
\lim_{n\to\infty}
\sup_{0\le t\le1}
\left|
W^{(n)}_t(\omega)
-
\widetilde{W}_t(\omega)
\right|
$$

for every $\omega\in\Omega$, for some random path $\widetilde{W}_t$ over $t\in[0,1]$.

Then consider an i.i.d. collection of $\{\widetilde{W}^{(n)}_t\}_{n\ge0}$ and stitch them together so that

$$
\hat{W}_t
=
\widetilde{W}^{(\floor{t})}_{t-\floor{t}}
+
\sum_{n=0}^{\floor{t}-1}
\widetilde{W}^{(n)}_1
$$

for $t\ge0$.

One can then check that this $\hat{W}$ is indeed our standard Brownian motion. As a hint, conditions (ii) and (iii) are equivalent to checking

$$
\Exp{\hat{W}_t}=0
\andtext
\operatorname{Cov}(\hat{W}_s,\hat{W}_t)
=
\min\curly{s,t}.
$$

**ADD SKETCHES HERE OF THE CONSTRUCTION**

:::

## Properties

## The Maximum and the Arcsine Laws

## Hitting Times and Recurrence
