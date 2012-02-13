//
//  main.c
//  OSTN02
//
//  Created by George MacKerron on 24/12/2011.
//  Copyright (c) 2011 George MacKerron. All rights reserved.
//

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "OSTN02.h"
#include "geoids.data"

#define CSVSCANFMT "%" DBLFMT "%*[ \t,;:|]%" DBLFMT "%*[ \t,;:|]%" DBLFMT "%*[ \t,;:|\r]\n"

int main (int argc, const char * argv[]) {
  
  // with arg 'test', run tests
  if (argc == 2 && strcmp(argv[1], "test") == 0) {
    bool passed = test(true);
    return passed ? EXIT_SUCCESS : EXIT_FAILURE;
    
  // with arg 'list-geoids', show geoid datum names and regions
  } else if (argc == 2 && strcmp(argv[1], "list-geoids") == 0) {
    puts(BOLD "\nFlag  Datum          Region" UNBOLD);
    const int len = LENGTH_OF(OSGB36GeoidNames);
    for (int i = 0; i < len; i ++)
      printf("  %2d  %-13s  %s\n", i, OSGB36GeoidNames[i], OSGB36GeoidRegions[i]);
    printf("\n");
    
  // with arg 'gps-to-grid' and (possibly) 3 additional args, convert ETRS89 lat/lon/elevation to OSGB36 e/n/elevation...
  } else if ((argc == 2 || argc == 5) && strcmp(argv[1], "gps-to-grid") == 0) {
    
    // with no additional args, convert CSV (or similar) on STDIN to CSV on STDOUT
    if (argc == 2) {
      LatLonDecimal latLon;
      int scanResult;
      while((scanResult = scanf(CSVSCANFMT, &latLon.lat, &latLon.lon, &latLon.elevation)) == 3) {
        EastingNorthing en = OSGB36EastingNorthingFromETRS89EastingNorthing(ETRS89EastingNorthingFromETRS89LatLon(latLon));
        printf("%.3" DBLFMT ",%.3" DBLFMT ",%.3" DBLFMT ",%d\n", en.e, en.n, en.elevation, en.geoid);
      }
      return scanResult == EOF ? EXIT_SUCCESS : EXIT_FAILURE;
    
    // with 3 additional args, convert these with friendly output
    } else {
      LatLonDecimal latLon;
      latLon.lat = latLon.lon = latLon.elevation = 0;
      sscanf(argv[2], "%" DBLFMT, &latLon.lat);
      sscanf(argv[3], "%" DBLFMT, &latLon.lon);
      sscanf(argv[4], "%" DBLFMT, &latLon.elevation);
      printf("\nETRS89 in  ");
      printf(LLFMT, latLon.lat, latLon.lon, latLon.elevation);
      EastingNorthing en = OSGB36EastingNorthingFromETRS89EastingNorthing(ETRS89EastingNorthingFromETRS89LatLon(latLon));
      if (en.geoid == 0) {
        puts("\nCoordinates outside OSTN02 range\n");
        return EXIT_FAILURE;
      }
      printf("\nOSGB36 out ");
      printf(ENFMT, en.e, en.n, en.elevation, OSGB36GeoidRegions[en.geoid], OSGB36GeoidNames[en.geoid]);
      printf("\n\n");
      return EXIT_SUCCESS;
    }
  
  // with arg 'grid-to-gps' and (possibly) 3 additional args, convert OSGB36 e/n/elevation to ETRS89 lat/lon/elevation...
  } else if ((argc == 2 || argc == 5) && strcmp(argv[1], "grid-to-gps") == 0) {
    
    // with no additional args, convert CSV (or similar) on STDIN to CSV on STDOUT
    if (argc == 2) {
      EastingNorthing en;
      int scanResult;
      while((scanResult = scanf(CSVSCANFMT, &en.e, &en.n, &en.elevation)) == 3) {
        LatLonDecimal latLon = ETRS89LatLonFromETRS89EastingNorthing(ETRS89EastingNorthingFromOSGB36EastingNorthing(en));
        if (latLon.geoid == 0) latLon.lat = latLon.lon = latLon.elevation = 0;
        printf("%.6" DBLFMT ",%.6" DBLFMT ",%.3" DBLFMT ",%d\n", latLon.lat, latLon.lon, latLon.elevation, latLon.geoid);
      }
      return scanResult == EOF ? EXIT_SUCCESS : EXIT_FAILURE;
      
    // with 3 additional args, convert these with friendly output
    } else {
      EastingNorthing en;
      en.n = en.e = en.elevation = 0;
      sscanf(argv[2], "%" DBLFMT, &en.e);
      sscanf(argv[3], "%" DBLFMT, &en.n);
      sscanf(argv[4], "%" DBLFMT, &en.elevation);
      LatLonDecimal latLon = ETRS89LatLonFromETRS89EastingNorthing(ETRS89EastingNorthingFromOSGB36EastingNorthing(en));
      printf("\nOSGB36 in  ");
      printf(ENFMT, en.e, en.n, en.elevation, OSGB36GeoidRegions[latLon.geoid], OSGB36GeoidNames[latLon.geoid]);  // latLon.geoid has the geoid used in the conversion
      if (latLon.geoid == 0) {
        puts("\nCoordinates outside OSTN02 range\n");
        return EXIT_FAILURE;
      }
      printf("\nETRS89 out ");
      printf(LLFMT, latLon.lat, latLon.lon, latLon.elevation);
      printf("\n\n");
      return EXIT_SUCCESS;
    }
    
  // with any other arguments, show help text
  } else {
    puts("\n" INVERSE " OSTN02C -- https://github.com/jawj/OSTN02C -- Built " __DATE__ " " __TIME__ " (" NUMDESC " precision) " UNINVERSE "\n"
         "\n"
         "This tool converts coordinates between ETRS89 (WGS84, GPS) lat/lon/elevation and OSGB36 easting/northing/elevation.\n"
         "Conversions make use of Ordnance Survey's OSTN02 and OSGM02 transformations, and should thus be accurate to within 1m.\n"
         "\n"
         "Usage: " BOLD "OSTN02C gps-to-grid " UNBOLD "[" BOLD ULINE "lat" UNULINE " " ULINE "lon" UNULINE " " ULINE "elevation" UNULINE UNBOLD "] converts ETRS89 to OSGB36\n"
         "       " BOLD "OSTN02C grid-to-gps " UNBOLD "[" BOLD ULINE "easting" UNULINE " " ULINE "northing" UNULINE " " ULINE "elevation" UNULINE UNBOLD "] converts OSGB36 to ETRS89\n"
         "       " BOLD "OSTN02C list-geoids" UNBOLD " lists the geoid datum flags, names and regions\n"
         "       " BOLD "OSTN02C test" UNBOLD " checks embedded data integrity and runs conversion tests with known coordinates\n"
         "       " BOLD "OSTN02C help" UNBOLD " displays this message\n"
         "\n"
         "The conversion commands " BOLD "gps-to-grid" UNBOLD " and " BOLD "grid-to-gps" UNBOLD " can be used in two ways:\n"
         "* Given a set of coordinates as command-line arguments, they will convert this set with user-friendly output\n"
         "* Given no command-line arguments, they will convert batches of coordinates, reading from STDIN and writing to STDOUT\n"
         "\n"
         "In the batch conversion case:\n"
         "* Input rows must have 3 columns -- lat or easting, lon or northing, elevation -- with any reasonable separator (,;:| \\t)\n"
         "* Output rows have 4 columns -- easting or lat, northing or lon, elevation, geoid datum flag -- separated with commas (,)\n"
         "* In case of out-of-range input coordinates, all output columns will be zero\n"
         "* Malformatted input terminates processing and results in a non-zero exit code\n"
         "\n"
         "Software copyright (c) George MacKerron 2012 (http://mackerron.com)\n"
         "Released under the MIT licence (http://www.opensource.org/licenses/mit-license.php)\n\n"
         "OSTN02 and OSGM02 are trademarks of Ordnance Survey\n"
         "Embedded OSTN02 and OSGM02 data are (c) Crown copyright 2002. All rights reserved.\n");
    return EXIT_SUCCESS;
    
  }
}

