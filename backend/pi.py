from mpmath import mp

def get_pi_to_n_decimals(n):
    mp.dps = n + 1
    return str(mp.pi)

# save as txt

size = 10000000


with open('pi.txt', 'w') as f:
    f.write(get_pi_to_n_decimals(size))