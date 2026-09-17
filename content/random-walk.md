# Random Walk

The random walk is an example of a Markov process (more on these coming soon). On this page, we will consider random walks on $\mathbb{Z}^n$.

## Definition

Suppose you start at position $0$. You toss a fair coin. If you tossed heads, move to the right by $1$; if you tossed tails, move to the left by $1$. Repeat this process of tossing the coin and moving to the left or the right by $1$. For example, tossing $HHTTTHT$ corresponds to $0 \rightarrow 1 \rightarrow 2 \rightarrow 1 \rightarrow 0 \rightarrow -1 \rightarrow 0  \rightarrow -1$.

**Coming soon: figures of the above random walk**

We can fomulate this mathematically as follows.

::: def Simple Symmetric Random Walk
Let $\curly{X_i}_{i\in \mathbb{N}}$ be a collection of i.i.d. random variables where $\prob{X_1=+1}=\prob{X_1=-1}=1/2$. Then define

$$
S_0 = 0 \andtext S_n = \sum_{i=1}^n X_i.
$$

Then $(S_n)_{n\ge 0}$ is the **simple symmetric random walk (SSRW)**.
:::

The term _simple_ is to signify that the step size is always 1: $|S_{n+1}-S_{n}| = 1$ almost surely. We use the term _symmetric_ because the probability of moving left or right is equal. Naturally, the symmetry can be relaxed.

::: def- Simple Random Walk
Let $\curly{X_i}_{i\in \mathbb{N}}$ be a collection of i.i.d. random variables where $\prob{X_1=+1}=p$ and $\prob{X_1=-1}=1-p=: q$. Then define

$$
S_0 = 0 \andtext S_n = \sum_{i=1}^n X_i.
$$

Then $(S_n)_{n\ge 0}$ is the **simple random walk (SSRW)** with drift $p$.
:::

<!-- ## Counting Paths and the Ballot Theorem -->

<!-- ## Renewal and Recurrence  -->

<!-- ## The Law of the Interated Logarithm -->

$$
$$
