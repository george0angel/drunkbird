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

Then, $(S_n)_{n\ge 0}$ is the **simple symmetric random walk (SSRW)**.
:::

The term _simple_ is to signify that the step size is always 1: $|S_{n+1}-S_{n}| = 1$ almost surely. We use the term _symmetric_ because the probability of moving left or right is equal. Naturally, the symmetry can be relaxed.

::: def- Simple Random Walk
Let $\curly{X_i}_{i\in \mathbb{N}}$ be a collection of i.i.d. random variables where $\prob{X_1=+1}=p$ and $\prob{X_1=-1}=1-p=: q$. Then define

$$
S_0 = 0 \andtext S_n = \sum_{i=1}^n X_i.
$$

Then, $(S_n)_{n\ge 0}$ is the **simple random walk (SSRW)** with drift $p$.
:::

From the definition of the SSRW one can find:

$$
\Exp{S_n} = 0, \; \; \Var{S_n}=n, \andtext \condExp{S_n}{\mathcal{F}_m}=S_m
$$

where $m\le n$ and $\mathcal{F}_n=\sigma(X_1,\ldots, X_n)$ is the natural filtration.

:::: exercise-
Check the above statements, i.e. show $\Exp{S_n} = 0, \; \; \Var{S_n}=n, \andtext \condExp{S_n}{\mathcal{F}_m}=S_m.$

Further, suppose we are no longer in the symmetric case so that $\prob{X_1=+1}=p$ for $p\in [0,1]$. Find the $\Exp{S_n}, \Var{S_n},$ and $\condExp{S_n}{\mathcal{F}_m}$ for $m\le n$.
::: green- Solution
Fistly, in the symmetric case, we have for each step that

$$
\Exp{X_1} = \frac{1}{2}(1)+\frac{1}{2}(-1)=0 \andtext \Var{X_1}=\Exp{X_1^2}-\Exp{X_1}^2 = 1 - 0 = 1.
$$

So it immediately follows that

$$
\Exp{S_n} = \Exp{\sum_{i=0}^n X_i} = \sum_{i=0}^n \Exp{X_i} = n \times 0 = 0.
$$

By independence of each step we have

$$
\Var{S_n} = \Var{\sum_{i=0}^n X_i} = \sum_{i=0}^n \Var{X_i} = n \times 1 = n.
$$

And, noting that the first $m$ steps of the process are $\mathcal{F_m}$-measurable and the remaining $n-m$ steps are independent of $\mathcal{F_m}$, we have

$$
\condExp{S_n}{\mathcal{F}_m} = \condExp{S_m + \sum_{i=m+1}^n X_i}{\mathcal{F}_m} = S_m + \sum_{i=m+1}^n \Exp{X_i} = S_m.
$$

:::
::::

<!-- ## Counting Paths and the Ballot Theorem -->

<!-- ## Renewal and Recurrence  -->

<!-- ## The Law of the Interated Logarithm -->

$$
$$
