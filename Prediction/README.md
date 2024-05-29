# GENERARE DE DATE INITIALE

Ne limitam la Signal_Strength, Signal_Quality si Cell_Load.

Cell_Load - random intre 0 si 1 (100%).

Signal_Strength: random, cu valori intre -50 si -100 (dB) 
daca Signal_Strength este intre -50 si -65,  Signal_Quality va fi tot random intre -5 si -10,
daca Signal_Strength este intre -65 si -85,  Signal_Quality va fi tot random intre -10 si -15,
daca Signal_Strength este intre -85 si -100,  Signal_Quality va fi tot random intre -15 si -20,

Experiment 1:
pt cazul 1 de mai sus: nu se face Handover (Handover_Decision = 0)
pt cazul 3                            se face Handover (Handover_Decision = 1)
pt cazul 2                            se pune Handover_Decision = 0 sau 1 random

Experiment 2:
ca si exp. 1, dar pentru cazul 2 se considera Handover_decision determinata de Cell_Load.
Putem incerca Handover_decision = 0 daca Cell_Load peste 0.5 siHandover_decision = 1 daca Cell_Load este sub 0.5."

Am folosit aceasta logica propusa de dvs. peste care am adaugat si praguri P1=75 si Q1=12.5(jumatate din RSRP si RSRQ).



Creez un tabel .csv cu cell load, RSRP, RSRQ si decizia handover. (1000 esantioane)

# ANTRENARE MODEL

	Citesc tabelul creat.
	Definesc coloanele de interes pentru decizia target (Handover) - Cell load, RSRP, RSRQ.
	Impart cele 1000 de esantioane cu ratia 0.2: 800 de antrenament si 200 de testare.
	Creez un obiect de tip RandomForestClassifier din libraria sklearn, in care poti modifica parametri precum cate decision trees sa foloseasca(n_estimators) sau max_features, adica cate coloane random sa ia in calcul de fiecare data cand creeaza un decision tree(e pus ca radical din cate coloane is in total)
	Antrenam modelul cu model.fit(X_train,Y_train) (y e handover_decision si x reprezinta restul coloanelor). (ignorati linia 31-42, era doar sa vad cum impacteaza acuratetea predictiei daca schimbam numarul de decision trees).
	Folosim diverse metode de a evalua modelul antrenat, comparand predictia acestuia cu Y_test.
	Salvam modelul pentru a nu trebui sa il antrenam de fiecare data.

# FOLOSIRE MODEL
	Deschidem modelul antrenat cu algoritmul Random Forest si datele noastre.
	Citesc tabelul cu datele ce dorim sa le analizam (in aceeasi ordine coloanele ca si in tabelul cu date de antrenament, dar diferenta cheie ca nu are coloana de handover_decision, stim doar cell load, rsrp, rsrq si nu stim daca se doreste handover sau nu)
	Folosim modelul cu loaded_model.predict(X) (X reprezinta coloanele cell load, rsrp, rsrq) pentru oricat de multe esantioane dorim, nu trebuie sa fie multe pentru ca modelul e deja antrenat, se poate si cu unul singur.
	Astfel, in variabila predictions avem o lista cu deciziile de handover calculate.
	Daca avem si handover_decision real, il putem compara cu cel calculat si observam ca modelul antrenat are o acuratete foarte mare, probabil pentru ca datele noastre sunt generate folosind o logica destul de simpla.
	