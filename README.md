# PLU2PLUS
Code for the experiments of the PLU++ project

1. Ouvrir le fichier rendu.html avec un navigateur (de préférence Firefox).

Si vous utilisez Chrome, il faudra sans doute ajouter --allow-file-access-from-files dans le champ "cible" du raccourci (accessible depuis les propriétés). Cela permet au navigateur d'accéder aux fichiers locaux nécessaires (ici les photos de texture des bâtiments), ce qui n'est pas possible par défaut pour des raisons de sécurité.


2. Cliquer sur « Choisissez un fichier » et sélectionnez n'importe lequel des fichiers dans le dossier JSON. Une configuration de bâtiments est chargée (cela peut prendre un peu de temps).


3. Une fois tous les éléments de la page chargés, vous pouvez agir sur les sliders pour modifier pour chaque couche les éléments suivants :
    - nom
    - transparence
    - couleur  
    - type d'arête (et ses paramètres)
    - type de surface (et ses paramètres)
Vous pouvez également basculer entre le cadastre et l'orthophoto.


4. Dans le menu "Captures d'écran", il est possible de prendre des captures en cliquant sur « Capture d'écran ». Le compteur en dessous se met à jour pour indiquer combien de photos ont été prises. Il est possible de les télécharger toutes ensemble en cliquant ensuite sur « Télécharger les images ».
Note : vous pouvez également prendre une capture d'écran unique en appuyant sur la touche "=" (signe égal). L'image s'affiche alors dans un nouvel onglet et vous pouvez l'enregistrer manuellement.

5. Dans le menu "Caméra et ombrage", vous pouvez cliquer sur « Réinitialiser la caméra » avant de prendre une capture si vous souhaitez le même point de vue sur toutes les images.
Il est possible de désactiver l'ombre projetée des objets et de déplacer la source de lumière.

6. Le menu "Gestion des couches" permet de supprimer ou de dupliquer une couche en entrant son nom et en appuyant sur "Entrée". Vous pouvez également charger une nouvelle couche depuis un fichier .obj dans le dossier "/models" en cliquant sur "Ajouter une couche".

7. Les sliders "hauteur initiale" et "pente" permettent de visualiser différentes simulations.

8. Enfin, vous pouvez sauvegarder les paramètres actuels en cliquant sur « Sauvegarder la configuration ». Vous pourrez alors charger ce fichier au prochain lancement de la page.