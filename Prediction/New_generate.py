
import pandas as pd
import numpy as np
import random

P1=75
Q1=12.5

def perform_handover(RSRP, RSRQ, cell_load):
    if(cell_load > 0.5):
        handover_decision = 1
    elif RSRP < P1:
        if RSRQ < Q1:
            handover_decision = 1
            
        else:
            handover_decision = 0

    else:
        if RSRQ < Q1:
            handover_decision = 1
        else:
            handover_decision = 0
    return handover_decision
   

def generate_data():
    cell_load = round(np.random.uniform(0, 1), 2)

    signal_strength = round(np.random.uniform(50, 100), 2)

    if 85 <= signal_strength < 100:
        signal_quality = round(np.random.uniform(15, 20), 2)
        
    elif 65 <= signal_strength < 85:
        signal_quality = round(np.random.uniform(10, 15), 2)
        
    elif 50 <= signal_strength < 65:
        signal_quality = round(np.random.uniform(5, 10), 2)
        
    handover_decision = perform_handover(signal_strength, signal_quality,cell_load)
    return [cell_load, signal_strength, signal_quality, handover_decision]

def main():
    n_samples = 1000

    data = [generate_data() for _ in range(n_samples)]
    df = pd.DataFrame(data, columns=["Cell_Load", "RSRP", "RSRQ", "Handover_Decision"])

    df.to_csv("handover_data.csv", index=False)

if __name__ == "__main__":
    main()
